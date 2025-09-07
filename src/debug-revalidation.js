// Temporary debug script for manual group revalidation
// Add this to your browser console or create a temporary debug component

export const forceGroupRevalidation = async () => {
  try {
    console.log('🔄 Starting manual group revalidation...');
    
    // Clear existing authentication data
    localStorage.removeItem('userToken');
    localStorage.removeItem('sessionData');
    
    // Clear ArcGIS credentials
    const IdentityManager = (await import('@arcgis/core/identity/IdentityManager')).default;
    await IdentityManager.destroyCredentials();
    console.log('🧹 Cleared existing credentials');
    
    // Trigger fresh authentication
    const portalUrl = process.env.REACT_APP_PORTAL_URL;
    const credential = await IdentityManager.getCredential(portalUrl + '/sharing/rest');
    console.log('🔑 Got fresh credential:', credential.userId);
    
    // Check user groups immediately
    const userUrl = `${portalUrl}/sharing/rest/community/users/${credential.userId}`;
    const params = new URLSearchParams({
      f: 'json',
      token: credential.token
    });
    
    const response = await fetch(`${userUrl}?${params}`);
    const userData = await response.json();
    
    const requiredGroupId = 'afa4ae2949554ec59972abebbfd0034c';
    const hasAccess = userData.groups?.includes(requiredGroupId);
    
    console.log('📊 Fresh group check results:', {
      userId: credential.userId,
      groups: userData.groups,
      requiredGroupId,
      hasAccess,
      timestamp: new Date().toISOString()
    });
    
    if (hasAccess) {
      console.log('✅ SUCCESS: User now has Sirius Users access!');
      console.log('🔄 Reload the page to apply changes');
    } else {
      console.log('❌ User still does not have Sirius Users access');
      console.log('⏳ Portal Enterprise changes may need more time to propagate');
    }
    
    return { hasAccess, userData };
    
  } catch (error) {
    console.error('❌ Manual revalidation failed:', error);
    return { hasAccess: false, error };
  }
};

// Usage: Copy and paste this into browser console, then run:
// forceGroupRevalidation();