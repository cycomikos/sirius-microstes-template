import { SECURITY_CONFIG } from '../constants';
import { authService } from './authService';
import { validateSiriusAccess, logSecurityEvent, fetchUserGroups } from '../utils/portalUtils';
import Portal from '@arcgis/core/portal/Portal';

export class GroupValidationService {
  private static instance: GroupValidationService;
  private validationTimer: NodeJS.Timeout | null = null;
  private onGroupValidationFailed: (() => void) | null = null;
  private lastActivity: number = Date.now();
  private isValidating: boolean = false;
  private focusCheckEnabled: boolean = true;

  static getInstance(): GroupValidationService {
    if (!GroupValidationService.instance) {
      GroupValidationService.instance = new GroupValidationService();
    }
    return GroupValidationService.instance;
  }

  initialize(onGroupValidationFailed: () => void): void {
    this.onGroupValidationFailed = onGroupValidationFailed;
    this.startPeriodicValidation();
    this.setupEventListeners();
    
    console.log('🔄 Group validation service initialized');
    console.log(`📅 Checking every ${SECURITY_CONFIG.GROUP_CHECK_INTERVAL / 60000} minutes`);
  }

  private startPeriodicValidation(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }

    this.validationTimer = setInterval(() => {
      this.validateCurrentUserGroups('PERIODIC_CHECK');
    }, SECURITY_CONFIG.GROUP_CHECK_INTERVAL);
  }

  private setupEventListeners(): void {
    // Check on window focus (user returns to app)
    if (SECURITY_CONFIG.GROUP_CHECK_ON_FOCUS) {
      window.addEventListener('focus', this.handleWindowFocus.bind(this));
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // Track user activity
    if (SECURITY_CONFIG.GROUP_CHECK_ON_ACTIVITY) {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, this.updateActivity.bind(this), { passive: true });
      });
    }
  }

  private handleWindowFocus(): void {
    if (!this.focusCheckEnabled) return;
    
    console.log('👀 Window gained focus - checking group membership');
    this.validateCurrentUserGroups('FOCUS_CHECK');
  }

  private handleVisibilityChange(): void {
    if (!document.hidden && this.focusCheckEnabled) {
      console.log('👁️ Tab became visible - checking group membership');
      this.validateCurrentUserGroups('VISIBILITY_CHECK');
    }
  }

  private updateActivity(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    
    // If user was idle and now active, check groups
    if (timeSinceLastActivity > SECURITY_CONFIG.IDLE_THRESHOLD) {
      console.log('⚡ User active after idle period - checking group membership');
      this.validateCurrentUserGroups('ACTIVITY_CHECK');
    }
    
    this.lastActivity = now;
  }

  private async validateCurrentUserGroups(trigger: string): Promise<void> {
    if (this.isValidating) {
      console.log('⏳ Group validation already in progress, skipping...');
      return;
    }

    try {
      this.isValidating = true;
      console.log(`🔍 Validating group membership (trigger: ${trigger})`);

      // Get current portal instance
      const portal = new Portal({
        url: process.env.REACT_APP_PORTAL_URL
      });

      await portal.load();

      if (!portal.user) {
        console.warn('⚠️ No portal user available for group validation');
        return;
      }

      // Fetch fresh group membership from server
      const { groupIds, groupNames } = await fetchUserGroups(portal, portal.user.username);
      
      console.log('📋 Current groups from server:', groupNames);
      console.log('🔑 Current group IDs:', groupIds);

      // Validate Sirius Users access
      const accessCheck = validateSiriusAccess(groupIds, groupNames);

      if (!accessCheck.hasAccess) {
        console.error('🚨 USER LOST SIRIUS GROUP ACCESS!');
        console.error('User:', portal.user.username);
        console.error('Required group ID:', SECURITY_CONFIG.REQUIRED_GROUP_ID);
        console.error('Current groups:', groupNames);

        // Log security event
        logSecurityEvent('ACCESS_DENIED', {
          username: portal.user.username,
          groups: groupNames,
          groupIds: groupIds
        });

        // Notify the application that group access was lost
        if (this.onGroupValidationFailed) {
          this.onGroupValidationFailed();
        }
      } else {
        console.log(`✅ Group validation passed (${trigger})`);
        console.log(`🎯 Matched group: ${accessCheck.matchedGroupName} (${accessCheck.matchedGroupId})`);
      }

    } catch (error) {
      console.error('❌ Group validation failed:', error);
      
      // On validation error, we could either:
      // 1. Fail secure (sign out user) - more secure
      // 2. Allow to continue - better UX
      // For now, we'll log the error and continue, but this could be configurable
      console.warn('⚠️ Continuing despite validation error - consider failing secure in production');
      
    } finally {
      this.isValidating = false;
    }
  }

  // Manual validation trigger (can be called by components)
  async validateNow(): Promise<boolean> {
    try {
      await this.validateCurrentUserGroups('MANUAL_CHECK');
      return true;
    } catch (error) {
      console.error('Manual group validation failed:', error);
      return false;
    }
  }

  // Temporarily disable focus checks (useful during certain operations)
  disableFocusChecks(): void {
    this.focusCheckEnabled = false;
    console.log('🔇 Focus-based group checks disabled');
  }

  enableFocusChecks(): void {
    this.focusCheckEnabled = true;
    console.log('🔊 Focus-based group checks enabled');
  }

  cleanup(): void {
    console.log('🧹 Cleaning up group validation service');
    
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = null;
    }

    // Remove event listeners
    window.removeEventListener('focus', this.handleWindowFocus.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.removeEventListener(event, this.updateActivity.bind(this));
    });

    this.onGroupValidationFailed = null;
    this.focusCheckEnabled = false;
  }

  // Get validation status
  getStatus(): {
    isRunning: boolean;
    lastActivity: number;
    isValidating: boolean;
    nextCheckIn: number;
  } {
    const nextCheck = this.validationTimer ? SECURITY_CONFIG.GROUP_CHECK_INTERVAL : 0;
    
    return {
      isRunning: !!this.validationTimer,
      lastActivity: this.lastActivity,
      isValidating: this.isValidating,
      nextCheckIn: nextCheck
    };
  }
}

export const groupValidationService = GroupValidationService.getInstance();