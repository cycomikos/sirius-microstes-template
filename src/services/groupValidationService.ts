import { SECURITY_CONFIG } from '../constants';
import { validateSiriusAccess, logSecurityEvent, fetchUserGroups } from '../utils/portalUtils';
import { groupValidationLogger, securityLogger } from '../utils/logger';
import Portal from '@arcgis/core/portal/Portal';
import IdentityManager from '@arcgis/core/identity/IdentityManager';

type ValidationTrigger = 'PERIODIC_CHECK' | 'FOCUS_CHECK' | 'VISIBILITY_CHECK' | 'ACTIVITY_CHECK' | 'MANUAL_CHECK';

interface ValidationState {
  isRunning: boolean;
  isValidating: boolean;
  lastValidation: number;
  lastActivity: number;
  focusCheckEnabled: boolean;
}

interface ValidationStatus extends ValidationState {
  nextCheckIn: number;
  isHealthy: boolean;
}

/**
 * Service responsible for periodically validating user group membership
 * to detect when administrators remove users from required groups
 */
export class GroupValidationService {
  private static instance: GroupValidationService;
  
  // Core state management
  private state: ValidationState = {
    isRunning: false,
    isValidating: false,
    lastValidation: 0,
    lastActivity: Date.now(),
    focusCheckEnabled: true
  };
  
  // Timer and callback management
  private validationTimer: NodeJS.Timeout | null = null;
  private onGroupValidationFailed: (() => void) | null = null;
  
  // Event listeners cleanup references
  private eventCleanupFunctions: (() => void)[] = [];

  // Singleton pattern
  static getInstance(): GroupValidationService {
    if (!GroupValidationService.instance) {
      GroupValidationService.instance = new GroupValidationService();
    }
    return GroupValidationService.instance;
  }

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Initialize the group validation service
   * @param onGroupValidationFailed Callback when user loses group access
   */
  initialize(onGroupValidationFailed: () => void): void {
    // Prevent double initialization
    if (this.state.isRunning) {
      groupValidationLogger.warn('Group validation service already initialized');
      return;
    }

    this.onGroupValidationFailed = onGroupValidationFailed;
    this.state.isRunning = true;
    
    this.startPeriodicValidation();
    this.setupEventListeners();
    
    this.logInitialization();
  }

  /**
   * Stop the service and clean up all resources
   */
  stop(): void {
    if (!this.state.isRunning) {
      return;
    }

    groupValidationLogger.info('Stopping group validation service');
    
    this.state.isRunning = false;
    this.stopPeriodicValidation();
    this.removeEventListeners();
    
    // Reset validation state
    this.state.isValidating = false;
    this.state.focusCheckEnabled = true;
  }

  /**
   * Complete cleanup of the service
   */
  cleanup(): void {
    groupValidationLogger.info('Cleaning up group validation service');
    
    this.stop();
    this.onGroupValidationFailed = null;
    
    // Reset all state to initial values
    this.state = {
      isRunning: false,
      isValidating: false,
      lastValidation: 0,
      lastActivity: Date.now(),
      focusCheckEnabled: true
    };
  }

  /**
   * Manually trigger group validation
   */
  async validateNow(): Promise<boolean> {
    try {
      await this.validateCurrentUserGroups('MANUAL_CHECK');
      return true;
    } catch (error) {
      groupValidationLogger.error('Manual group validation failed', error);
      return false;
    }
  }

  /**
   * Get current service status
   */
  getStatus(): ValidationStatus {
    const now = Date.now();
    const timeSinceLastValidation = now - this.state.lastValidation;
    const nextCheckIn = this.state.isRunning 
      ? Math.max(0, SECURITY_CONFIG.GROUP_CHECK_INTERVAL - timeSinceLastValidation)
      : 0;
    
    return {
      ...this.state,
      nextCheckIn,
      isHealthy: this.isHealthy()
    };
  }

  /**
   * Check if service is running properly
   */
  isHealthy(): boolean {
    return this.state.isRunning && !this.state.isValidating && !!this.validationTimer;
  }

  /**
   * Control focus-based validation
   */
  disableFocusChecks(): void {
    this.state.focusCheckEnabled = false;
    groupValidationLogger.info('Focus-based group checks disabled');
  }

  enableFocusChecks(): void {
    this.state.focusCheckEnabled = true;
    groupValidationLogger.info('Focus-based group checks enabled');
  }

  // Private methods

  private logInitialization(): void {
    groupValidationLogger.info(`Group validation service initialized - Checks every ${SECURITY_CONFIG.GROUP_CHECK_INTERVAL / 60000}min, Focus:${SECURITY_CONFIG.GROUP_CHECK_ON_FOCUS}, Activity:${SECURITY_CONFIG.GROUP_CHECK_ON_ACTIVITY}`);
  }

  private startPeriodicValidation(): void {
    // Clear any existing timer first
    this.stopPeriodicValidation();

    groupValidationLogger.debug('Starting periodic validation timer');
    this.validationTimer = setInterval(() => {
      if (this.state.isRunning) {
        this.validateCurrentUserGroups('PERIODIC_CHECK');
      }
    }, SECURITY_CONFIG.GROUP_CHECK_INTERVAL);
  }

  private stopPeriodicValidation(): void {
    if (this.validationTimer) {
      groupValidationLogger.debug('Stopping periodic validation timer');
      clearInterval(this.validationTimer);
      this.validationTimer = null;
    }
  }

  private setupEventListeners(): void {
    // Clear any existing listeners first
    this.removeEventListeners();

    // Setup focus-based validation
    if (SECURITY_CONFIG.GROUP_CHECK_ON_FOCUS) {
      this.setupFocusListeners();
    }

    // Setup activity-based validation
    if (SECURITY_CONFIG.GROUP_CHECK_ON_ACTIVITY) {
      this.setupActivityListeners();
    }

    groupValidationLogger.debug('Event listeners configured');
  }

  private setupFocusListeners(): void {
    const handleFocus = () => this.handleWindowFocus();
    const handleVisibility = () => this.handleVisibilityChange();
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    
    // Store cleanup functions
    this.eventCleanupFunctions.push(
      () => window.removeEventListener('focus', handleFocus),
      () => document.removeEventListener('visibilitychange', handleVisibility)
    );
  }

  private setupActivityListeners(): void {
    const handleActivity = () => this.updateActivity();
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
      this.eventCleanupFunctions.push(
        () => document.removeEventListener(event, handleActivity)
      );
    });
  }

  private removeEventListeners(): void {
    // Clean up all event listeners
    this.eventCleanupFunctions.forEach(cleanup => cleanup());
    this.eventCleanupFunctions = [];
  }

  private handleWindowFocus(): void {
    if (!this.shouldValidateOnEvent()) {
      return;
    }
    
    groupValidationLogger.debug('Window focus - checking groups');
    this.validateCurrentUserGroups('FOCUS_CHECK');
  }

  private handleVisibilityChange(): void {
    if (document.hidden || !this.shouldValidateOnEvent()) {
      return;
    }
    
    groupValidationLogger.debug('Tab visible - checking groups');
    this.validateCurrentUserGroups('VISIBILITY_CHECK');
  }

  private updateActivity(): void {
    if (!this.state.isRunning) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - this.state.lastActivity;
    
    // Check if user was idle and is now active
    if (timeSinceLastActivity > SECURITY_CONFIG.IDLE_THRESHOLD) {
      if (this.shouldValidateOnActivity()) {
        groupValidationLogger.debug('User active after idle - checking groups');
        this.validateCurrentUserGroups('ACTIVITY_CHECK');
      }
    }
    
    this.state.lastActivity = now;
  }

  private shouldValidateOnEvent(): boolean {
    if (!this.state.focusCheckEnabled || !this.state.isRunning) {
      return false;
    }
    
    const timeSinceLastValidation = Date.now() - this.state.lastValidation;
    const minInterval = 30000; // Don't validate more than once every 30 seconds
    
    return timeSinceLastValidation > minInterval;
  }

  private shouldValidateOnActivity(): boolean {
    if (!this.state.isRunning) return false;
    
    const timeSinceLastValidation = Date.now() - this.state.lastValidation;
    const minInterval = 60000; // Don't validate more than once every minute for activity
    
    return timeSinceLastValidation > minInterval;
  }

  private async validateCurrentUserGroups(trigger: ValidationTrigger): Promise<void> {
    // Prevent concurrent validations
    if (this.state.isValidating) {
      groupValidationLogger.debug('Group validation in progress, skipping');
      return;
    }

    // Check if service is still running (except for manual checks)
    if (!this.state.isRunning && trigger !== 'MANUAL_CHECK') {
      groupValidationLogger.debug('Service stopped, skipping validation');
      return;
    }

    try {
      this.state.isValidating = true;
      this.state.lastValidation = Date.now();
      
      groupValidationLogger.info(`Validating group membership (${trigger})`);

      const portal = await this.createAuthenticatedPortal();
      if (!portal?.user) {
        // Only log portal user warnings once every 5 minutes to reduce noise
        const now = Date.now();
        const lastPortalWarn = (this as any).lastPortalWarn || 0;
        if (now - lastPortalWarn > 300000) { // 5 minutes
          groupValidationLogger.warn('No portal user available for validation');
          (this as any).lastPortalWarn = now;
        }
        return;
      }

      const { groupIds, groupNames } = await fetchUserGroups(portal, portal.user.username);
      
      groupValidationLogger.debug('Groups validated', { groupNames, groupIds });

      const accessCheck = validateSiriusAccess(groupIds, groupNames);

      if (!accessCheck.hasAccess) {
        await this.handleAccessLost(portal.user.username, groupNames, groupIds);
      } else {
        groupValidationLogger.info(`Group validation passed (${trigger}) - ${accessCheck.matchedGroupName}`);
      }

    } catch (error) {
      groupValidationLogger.error('Group validation failed', error);
      groupValidationLogger.warn('Continuing despite validation error');
      
    } finally {
      this.state.isValidating = false;
    }
  }

  private async createAuthenticatedPortal(): Promise<Portal | null> {
    const portalUrl = process.env.REACT_APP_PORTAL_URL;
    if (!portalUrl) {
      groupValidationLogger.warn('No portal URL configured');
      return null;
    }

    // Check if user is still authenticated
    try {
      const credential = await IdentityManager.checkSignInStatus(portalUrl);
      if (!credential) {
        return null;
      }
    } catch (error) {
      // Only log authentication warnings once every 5 minutes to reduce noise
      const now = Date.now();
      const lastAuthWarn = (this as any).lastAuthWarn || 0;
      if (now - lastAuthWarn > 300000) { // 5 minutes
        groupValidationLogger.warn('User not authenticated, cannot validate groups');
        (this as any).lastAuthWarn = now;
      }
      return null;
    }

    const portal = new Portal({ url: portalUrl });
    await portal.load();
    return portal;
  }

  private async handleAccessLost(username: string, groupNames: string[], groupIds: string[]): Promise<void> {
    securityLogger.security('USER LOST SIRIUS GROUP ACCESS', {
      username,
      requiredGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID,
      currentGroups: groupNames
    });

    // Log security event
    logSecurityEvent('ACCESS_DENIED', {
      username,
      groups: groupNames,
      groupIds
    });

    // Stop the service and notify the application
    this.stop();
    
    if (this.onGroupValidationFailed) {
      this.onGroupValidationFailed();
    }
  }
}

// Export singleton instance
export const groupValidationService = GroupValidationService.getInstance();

// Export types for external use
export type { ValidationTrigger, ValidationState, ValidationStatus };