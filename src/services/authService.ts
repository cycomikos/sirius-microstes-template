import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import Portal from '@arcgis/core/portal/Portal';
import { User } from '../types/auth';
import { createUserFromPortal, fetchUserGroups, validateSiriusAccess, logSecurityEvent } from '../utils/portalUtils';
import { SECURITY_CONFIG } from '../constants';
import { authLogger, securityLogger } from '../utils/logger';

class AuthService {
  private oAuthInfo: OAuthInfo;
  private portal: Portal;

  constructor() {
    // Validate required environment variables
    if (!process.env.REACT_APP_ARCGIS_APP_ID || !process.env.REACT_APP_PORTAL_URL) {
      throw new Error('Missing required environment variables: REACT_APP_ARCGIS_APP_ID and REACT_APP_PORTAL_URL must be set');
    }

    // Configure OAuth for ArcGIS Enterprise
    this.oAuthInfo = new OAuthInfo({
      appId: process.env.REACT_APP_ARCGIS_APP_ID,
      portalUrl: process.env.REACT_APP_PORTAL_URL,
      popup: false,
      expiration: 20160
    });

    IdentityManager.registerOAuthInfos([this.oAuthInfo]);

    this.portal = new Portal({
      url: this.oAuthInfo.portalUrl
    });
  }

  async checkSession(): Promise<User | null> {
    try {
      const credential = await IdentityManager.checkSignInStatus(this.oAuthInfo.portalUrl);
      
      if (credential) {
        const portal = new Portal({ url: this.oAuthInfo.portalUrl });
        await portal.load();
        
        const user = await createUserFromPortal(portal, credential.token);
        
        // Only validate Sirius Users group access if this is not a route navigation check
        // This prevents authentication state loss during normal navigation
        if (SECURITY_CONFIG.ENFORCE_GROUP_CHECK) {
          try {
            const accessCheck = validateSiriusAccess(user.groupIds || [], user.groups);
            
            if (!accessCheck.hasAccess) {
              // Log security event and sign out user
              logSecurityEvent('ACCESS_DENIED', {
                username: user.username,
                groups: user.groups,
                groupIds: user.groupIds
              });
              
              // Sign out the user who lost Sirius access
              await this.signOut();
              
              // Throw error for proper handling instead of returning null
              const accessError = new Error(`Session invalid: User '${user.username}' is no longer a member of Sirius Users group`);
              (accessError as any).code = 'SIRIUS_ACCESS_DENIED';
              (accessError as any).userGroups = user.groups;
              (accessError as any).userGroupIds = user.groupIds;
              throw accessError;
            }
          } catch (groupCheckError) {
            // If group validation fails due to network issues, don't invalidate the session
            // Just log the issue and return the user (fail-safe approach)
            authLogger.warn('Group validation failed, but maintaining session', groupCheckError);
          }
        }
        
        return user;
      }
      
      return null;
    } catch (error) {
      authLogger.debug('No active session found', error);
      return null;
    }
  }

  async signIn(): Promise<User> {
    try {
      authLogger.info('🔐 Starting credential acquisition from ArcGIS Enterprise');
      
      // Add timeout promise to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Authentication request timed out after 25 seconds'));
        }, 25000);
      });
      
      const credentialPromise = IdentityManager.getCredential(this.oAuthInfo.portalUrl + '/sharing/rest');
      const credential = await Promise.race([credentialPromise, timeoutPromise]);
      
      const portal = new Portal({ 
        url: this.oAuthInfo.portalUrl
      });
      await portal.load();
      
      const user = await createUserFromPortal(portal, credential.token);
      
      // Validate Sirius Users group access using secure group ID
      if (SECURITY_CONFIG.ENFORCE_GROUP_CHECK) {
        authLogger.info('🔐 STARTING SIRIUS ACCESS VALIDATION', {
          username: user.username,
          groupIds: user.groupIds,
          groups: user.groups,
          requiredGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID,
          enforcementEnabled: SECURITY_CONFIG.ENFORCE_GROUP_CHECK
        });
        
        const accessCheck = validateSiriusAccess(user.groupIds || [], user.groups);
        
        if (!accessCheck.hasAccess) {
          authLogger.error('🚫 SIRIUS ACCESS DENIED - BLOCKING LOGIN', {
            username: user.username,
            groups: user.groups,
            groupIds: user.groupIds,
            requiredGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID
          });
          
          securityLogger.security('SIRIUS ACCESS DENIED', {
            username: user.username,
            groups: user.groups,
            groupIds: user.groupIds,
            requiredGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID
          });
          
          // Log security event for access denial
          logSecurityEvent('ACCESS_DENIED', {
            username: user.username,
            groups: user.groups,
            groupIds: user.groupIds
          });
          
          // Create a specific error for 403 handling
          const accessError = new Error(`Access denied: User '${user.username}' must be a member of Sirius Users group (ID: ${SECURITY_CONFIG.REQUIRED_GROUP_ID})`);
          (accessError as any).code = 'SIRIUS_ACCESS_DENIED';
          (accessError as any).httpStatus = 403;
          (accessError as any).userGroups = user.groups;
          (accessError as any).userGroupIds = user.groupIds;
          
          authLogger.error('🚫 THROWING ACCESS DENIED ERROR', { 
            errorCode: (accessError as any).code,
            errorMessage: accessError.message 
          });
          
          throw accessError;
        } else {
          authLogger.info('✅ SIRIUS ACCESS GRANTED - ALLOWING LOGIN', {
            username: user.username,
            matchedGroup: accessCheck.matchedGroupName,
            matchedGroupId: accessCheck.matchedGroupId
          });
        }
        
        authLogger.info('SIRIUS ACCESS GRANTED', {
          username: user.username,
          matchedGroup: accessCheck.matchedGroupName,
          matchedGroupId: accessCheck.matchedGroupId
        });
        
        // Log successful access
        logSecurityEvent('ACCESS_GRANTED', {
          username: user.username,
          groups: user.groups,
          groupIds: user.groupIds,
          matchedGroup: accessCheck.matchedGroupName,
          matchedGroupId: accessCheck.matchedGroupId
        });
      }
      
      return user;
    } catch (error) {
      authLogger.error('Sign in failed - detailed error:', {
        error: error,
        errorName: (error as any)?.name,
        errorMessage: (error as any)?.message,
        errorCode: (error as any)?.code,
        errorDetails: (error as any)?.details,
        errorStack: (error as any)?.stack
      });
      
      // Check for user cancellation/aborted authentication
      if (error instanceof Error) {
        const errorMessage = error.message?.toLowerCase() || '';
        const errorName = error.name?.toLowerCase() || '';
        const errorCode = (error as any)?.code?.toLowerCase() || '';
        
        // Comprehensive cancellation detection
        const cancellationIndicators = [
          'user aborted',
          'cancelled',
          'canceled',
          'popup blocked',
          'user denied',
          'user cancelled',
          'authentication cancelled',
          'login cancelled',
          'oauth cancelled',
          'access_denied',
          'user_cancelled',
          'authentication_cancelled'
        ];
        
        const isCancellation = cancellationIndicators.some(indicator => 
          errorMessage.includes(indicator) || 
          errorName.includes(indicator) || 
          errorCode.includes(indicator)
        ) || errorName === 'identitymanagererror' || 
           errorCode === 'identity-manager:user-aborted';
        
        if (isCancellation) {
          authLogger.info('🚫 User cancelled/aborted authentication - detected cancellation');
          const cancelError = new Error('User cancelled authentication');
          (cancelError as any).code = 'USER_CANCELLED';
          (cancelError as any).name = 'IdentityManagerError';
          throw cancelError;
        }
        
        // Re-throw specific access denied errors
        if (error.message.includes('Access denied')) {
          throw error;
        }
      }
      
      // For any other authentication error, also treat as potential cancellation
      // This is a fallback since ArcGIS Enterprise can throw various error types
      authLogger.warn('🔄 Unknown authentication error - treating as cancellation for safety');
      const cancelError = new Error('Authentication failed - treating as user cancellation');
      (cancelError as any).code = 'USER_CANCELLED';
      (cancelError as any).name = 'IdentityManagerError';
      throw cancelError;
    }
  }

  async signOut(): Promise<void> {
    try {
      await IdentityManager.destroyCredentials();
      
      // Securely clear all storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        // If storage clearing fails, at least remove known items
        const knownKeys = ['theme', 'userToken', 'sessionData'];
        knownKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch (e) {
            // Continue even if individual item removal fails
          }
        });
      }
      
      // Redirect to external portal after sign out
      const externalPortalUrl = 'https://publicgis.petronas.com/sirius-portal';
      authLogger.info('🚀 Sign out complete - redirecting to external portal:', externalPortalUrl);
      window.location.replace(externalPortalUrl);
    } catch (error) {
      authLogger.debug('Sign out failed', error);
      throw new Error('Sign out failed');
    }
  }

  hasGroupAccess(userGroups: string[], requiredGroups: string[]): boolean {
    if (!requiredGroups.length) return true;
    return requiredGroups.some(group => userGroups.includes(group));
  }

  async validateUserAccess(userId: string, requiredGroups: string[]): Promise<boolean> {
    try {
      // Always check Sirius Users group first
      const portal = new Portal({ url: this.oAuthInfo.portalUrl });
      await portal.load();
      
      if (!portal.user || portal.user.username !== userId) {
        return false;
      }
      
      // Fetch fresh group membership from server
      const { groupIds: serverGroupIds, groupNames: serverGroupNames } = await fetchUserGroups(portal, userId);
      
      // First check Sirius Users access using secure group ID
      if (SECURITY_CONFIG.ENFORCE_GROUP_CHECK) {
        const siriusAccess = validateSiriusAccess(serverGroupIds, serverGroupNames);
        if (!siriusAccess.hasAccess) {
          logSecurityEvent('ACCESS_DENIED', {
            username: userId,
            groups: serverGroupNames,
            groupIds: serverGroupIds
          });
          return false;
        }
      }
      
      // Then check additional required groups if any (using names for backward compatibility)
      if (requiredGroups.length > 0) {
        return requiredGroups.some(group => serverGroupNames.includes(group));
      }
      
      return true;
    } catch (error) {
      authLogger.debug('Server-side validation failed', error);
      // Fail secure - deny access on error
      return false;
    }
  }
}

export const authService = new AuthService();