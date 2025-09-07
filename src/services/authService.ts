import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import Portal from '@arcgis/core/portal/Portal';
import { User } from '../types/auth';
import { createUserFromPortal, fetchUserGroups } from '../utils/portalUtils';

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
        
        return await createUserFromPortal(portal, credential.token);
      }
      
      return null;
    } catch (error) {
      // Don't log sensitive error details in production
      if (process.env.NODE_ENV === 'development') {
        console.log('No active session found:', error);
      }
      return null;
    }
  }

  async signIn(): Promise<User> {
    try {
      const credential = await IdentityManager.getCredential(this.oAuthInfo.portalUrl + '/sharing/rest');
      
      const portal = new Portal({ 
        url: this.oAuthInfo.portalUrl
      });
      await portal.load();
      
      return await createUserFromPortal(portal, credential.token);
    } catch (error) {
      // Don't expose sensitive error details to users
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign in failed:', error);
      }
      throw new Error('Authentication failed');
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
      
      // Use replace instead of reload for better UX and security
      window.location.replace('/');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign out failed:', error);
      }
      throw new Error('Sign out failed');
    }
  }

  hasGroupAccess(userGroups: string[], requiredGroups: string[]): boolean {
    if (!requiredGroups.length) return true;
    return requiredGroups.some(group => userGroups.includes(group));
  }

  async validateUserAccess(userId: string, requiredGroups: string[]): Promise<boolean> {
    try {
      if (!requiredGroups.length) return true;
      
      // Server-side validation by re-querying the portal
      const portal = new Portal({ url: this.oAuthInfo.portalUrl });
      await portal.load();
      
      if (!portal.user || portal.user.username !== userId) {
        return false;
      }
      
      // Fetch fresh group membership from server
      const serverGroups = await fetchUserGroups(portal, userId);
      
      return requiredGroups.some(group => serverGroups.includes(group));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Server-side validation failed:', error);
      }
      // Fail secure - deny access on error
      return false;
    }
  }
}

export const authService = new AuthService();