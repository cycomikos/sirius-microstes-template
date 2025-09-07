import Portal from '@arcgis/core/portal/Portal';
import IdentityManager from '@arcgis/core/identity/IdentityManager';
import { User } from '../types/auth';
import { SECURITY_CONFIG } from '../constants';
import { authLogger, securityLogger } from './logger';

// Method to directly check if user is a MEMBER of the Sirius Users group
export const checkSiriusGroupDirectly = async (portal: Portal): Promise<boolean> => {
  try {
    if (!portal.user) {
      return false;
    }

    authLogger.debug('Checking Sirius group membership directly', { groupId: SECURITY_CONFIG.REQUIRED_GROUP_ID });
    
    // Check group membership using the users endpoint instead of group info
    const userUrl = `${portal.url}/sharing/rest/community/users/${portal.user.username}`;
    
    // Get token from IdentityManager instead of portal.credential
    let token: string | undefined;
    try {
      const credential = await IdentityManager.checkSignInStatus(portal.url);
      token = credential?.token;
    } catch (error) {
      authLogger.warn('No credential found for portal', error);
    }
    
    if (!token) {
      authLogger.warn('No token available for direct group check');
      return false;
    }
    
    const params = new URLSearchParams({
      f: 'json',
      token: token
    });

    const response = await fetch(`${userUrl}?${params}`);
    const userData = await response.json();
    
    authLogger.debug('Direct user membership check result', { 
      groups: userData.groups,
      username: portal.user.username 
    });
    
    // Check if user is actually a member of the Sirius group
    if (userData.groups && Array.isArray(userData.groups)) {
      const isMember = userData.groups.includes(SECURITY_CONFIG.REQUIRED_GROUP_ID);
      if (isMember) {
        authLogger.info('Direct group membership confirmed', { 
          groupId: SECURITY_CONFIG.REQUIRED_GROUP_ID,
          username: portal.user.username 
        });
        return true;
      }
    }
    
    if (userData.error) {
      authLogger.warn('Direct membership check error', { error: userData.error.message });
    } else {
      authLogger.info('User is not a member of Sirius Users group', { 
        userGroups: userData.groups,
        requiredGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID
      });
    }
    
    return false;
  } catch (error) {
    authLogger.warn('Direct group membership check failed', error);
    return false;
  }
};

// Alternative method to fetch user groups using REST API directly
export const fetchUserGroupsViaREST = async (portal: Portal): Promise<{ groupIds: string[]; groupNames: string[] }> => {
  try {
    if (!portal.user) {
      throw new Error('Portal user not available');
    }

    const username = portal.user.username;
    
    // Get token from IdentityManager
    let token: string | undefined;
    try {
      const credential = await IdentityManager.checkSignInStatus(portal.url);
      token = credential?.token;
    } catch (error) {
      authLogger.warn('No credential found for portal', error);
    }
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    authLogger.debug('Trying REST API method for user', { username });
    
    // Use the REST API directly to get user's groups
    const restUrl = `${portal.url}/sharing/rest/community/users/${username}`;
    const params = new URLSearchParams({
      f: 'json',
      token: token
    });

    const response = await fetch(`${restUrl}?${params}`);
    const userData = await response.json();
    
    authLogger.debug('REST API user data', userData);
    
    if (userData.error) {
      throw new Error(`REST API error: ${userData.error.message}`);
    }

    const groupIds: string[] = [];
    const groupNames: string[] = [];
    
    // Extract groups from user data
    if (userData.groups && Array.isArray(userData.groups)) {
      userData.groups.forEach((groupId: string) => {
        groupIds.push(groupId);
        authLogger.debug('Group ID from REST', { groupId });
      });
    }
    
    // Fetch group details to get names
    for (const groupId of groupIds) {
      try {
        const groupUrl = `${portal.url}/sharing/rest/community/groups/${groupId}`;
        const groupParams = new URLSearchParams({
          f: 'json',
          token: token
        });
        
        const groupResponse = await fetch(`${groupUrl}?${groupParams}`);
        const groupData = await groupResponse.json();
        
        if (groupData && groupData.title) {
          groupNames.push(groupData.title);
          authLogger.debug('Group details', { title: groupData.title, groupId });
        } else {
          groupNames.push('Unknown Group');
        }
      } catch (groupError) {
        authLogger.warn('Failed to fetch details for group', { groupId, error: groupError });
        groupNames.push('Unknown Group');
      }
    }
    
    authLogger.info('REST API found groups', { count: groupIds.length });
    return { groupIds, groupNames };
    
  } catch (error) {
    authLogger.error('REST API method failed', error);
    return { groupIds: [], groupNames: [] };
  }
};

export const fetchUserGroups = async (portal: Portal, username: string): Promise<{ groupIds: string[]; groupNames: string[] }> => {
  try {
    if (!portal.user) {
      throw new Error('Portal user not available');
    }

    const groupIds: string[] = [];
    const groupNames: string[] = [];
    
    authLogger.debug('Fetching groups for user', { username });
    
    // Method 1: Try to get groups directly from the portal user object (if available)
    // Note: portal.user.groups is not a standard property in ArcGIS JS API
    // This method is mainly for debugging and may not work
    if ((portal.user as any).groups && (portal.user as any).groups.length > 0) {
      authLogger.debug('Found groups in portal.user.groups', { count: (portal.user as any).groups.length });
      (portal.user as any).groups.forEach((group: any) => {
        groupIds.push(group.id);
        groupNames.push(group.title);
        authLogger.debug('Portal user group', { title: group.title, id: group.id });
      });
    }
    
    // Method 2: Query for groups the user is a member of
    try {
      const groupQuery = await portal.queryGroups({
        query: `member:${username}`,
        sortField: 'title' as const,
        sortOrder: 'asc' as const,
        num: 100 // Increase limit to catch more groups
      });
      
      authLogger.debug('Member query found groups', { count: groupQuery.results.length });
      
      // Add group IDs and names (avoid duplicates)
      groupQuery.results.forEach(group => {
        if (!groupIds.includes(group.id)) {
          groupIds.push(group.id);
          groupNames.push(group.title);
          authLogger.debug('Member of group', { title: group.title, id: group.id });
        }
      });
    } catch (memberQueryError) {
      authLogger.warn('Member query failed', memberQueryError);
    }
    
    // Method 3: Query for groups the user owns
    try {
      const ownedGroupQuery = await portal.queryGroups({
        query: `owner:${username}`,
        sortField: 'title' as const,
        sortOrder: 'asc' as const,
        num: 100
      });
      
      authLogger.debug('Owner query found groups', { count: ownedGroupQuery.results.length });
      
      // Add owned groups (avoid duplicates)
      ownedGroupQuery.results.forEach(group => {
        if (!groupIds.includes(group.id)) {
          groupIds.push(group.id);
          groupNames.push(group.title);
          authLogger.debug('Owner of group', { title: group.title, id: group.id });
        }
      });
    } catch (ownerQueryError) {
      authLogger.warn('Owner query failed', ownerQueryError);
    }
    
    authLogger.info('Group fetch summary', {
      totalGroups: groupIds.length,
      siriusGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID,
      hasSiriusAccess: groupIds.includes(SECURITY_CONFIG.REQUIRED_GROUP_ID)
    });
    
    return { groupIds, groupNames };
  } catch (groupError) {
    authLogger.error('Error fetching user groups', groupError);
    return { groupIds: [], groupNames: [] };
  }
};

export const createUserFromPortal = async (portal: Portal, token: string): Promise<User> => {
  const user = portal.user;
  if (!user) {
    throw new Error('User not found in portal');
  }

  authLogger.debug('Creating user from portal', { username: user.username });
  
  // Try multiple methods to get user groups
  let groupIds: string[] = [];
  let groupNames: string[] = [];
  
  // Method 1: Standard approach
  const standardResult = await fetchUserGroups(portal, user.username);
  groupIds = standardResult.groupIds;
  groupNames = standardResult.groupNames;
  
  // Method 2: If standard approach didn't find the required group, try REST API
  if (!groupIds.includes(SECURITY_CONFIG.REQUIRED_GROUP_ID)) {
    authLogger.debug('Standard method did not find Sirius Users group, trying REST API');
    const restResult = await fetchUserGroupsViaREST(portal);
    
    // Merge results (avoid duplicates)
    restResult.groupIds.forEach((id, index) => {
      if (!groupIds.includes(id)) {
        groupIds.push(id);
        groupNames.push(restResult.groupNames[index]);
      }
    });
  }
  
  // Method 3: If still no Sirius group found, try direct group access check
  if (!groupIds.includes(SECURITY_CONFIG.REQUIRED_GROUP_ID)) {
    authLogger.debug('Still no Sirius group found, trying direct group check');
    const hasDirectAccess = await checkSiriusGroupDirectly(portal);
    
    if (hasDirectAccess) {
      authLogger.info('Direct access confirmed - adding Sirius group to user groups');
      groupIds.push(SECURITY_CONFIG.REQUIRED_GROUP_ID);
      groupNames.push(SECURITY_CONFIG.REQUIRED_GROUP_NAME);
    }
  }
  
  // Ensure groupIds are strings, not objects
  const cleanGroupIds: string[] = [];
  const cleanGroupNames: string[] = [];
  
  groupIds.forEach((item, index) => {
    if (typeof item === 'string') {
      cleanGroupIds.push(item);
      cleanGroupNames.push(groupNames[index] || 'Unknown Group');
    } else if (typeof item === 'object' && item !== null && (item as any).id) {
      // Handle case where group objects were added instead of IDs
      cleanGroupIds.push((item as any).id);
      cleanGroupNames.push((item as any).title || 'Unknown Group');
      authLogger.debug('Extracted group from object', { 
        id: (item as any).id, 
        title: (item as any).title 
      });
    }
  });
  
  authLogger.info('Final user groups', {
    totalGroups: cleanGroupIds.length,
    hasSiriusAccess: cleanGroupIds.includes(SECURITY_CONFIG.REQUIRED_GROUP_ID),
    siriusGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID,
    groupIds: cleanGroupIds,
    groupNames: cleanGroupNames
  });

  return {
    username: user.username,
    fullName: user.fullName || user.username,
    groups: cleanGroupNames, // Keep names for backward compatibility
    groupIds: cleanGroupIds, // Add group IDs for secure validation
    token
  };
};

export const validateSiriusAccess = (userGroupIds: string[], userGroupNames?: string[]): { hasAccess: boolean; matchedGroupId?: string; matchedGroupName?: string } => {
  securityLogger.debug('Validating Sirius access', {
    userGroupIds,
    userGroupNames,
    requiredGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID
  });
  
  // STRICT validation - only allow the specific Sirius Users group ID
  const requiredGroupId = SECURITY_CONFIG.REQUIRED_GROUP_ID;
  
  securityLogger.debug('Checking for required group ID', { requiredGroupId });
  
  // Handle both string IDs and group objects (for compatibility)
  let hasAccess = false;
  let matchedGroupName: string = SECURITY_CONFIG.REQUIRED_GROUP_NAME;
  
  for (let i = 0; i < userGroupIds.length; i++) {
    const item = userGroupIds[i];
    
    // Check if it's a string ID or a group object
    let groupId: string;
    let groupName: string;
    
    if (typeof item === 'string') {
      groupId = item;
      groupName = userGroupNames?.[i] || SECURITY_CONFIG.REQUIRED_GROUP_NAME;
    } else if (typeof item === 'object' && item !== null) {
      // Handle group objects that might be passed instead of IDs
      groupId = (item as any).id;
      groupName = (item as any).title || SECURITY_CONFIG.REQUIRED_GROUP_NAME;
    } else {
      continue;
    }
    
    if (groupId === requiredGroupId) {
      hasAccess = true;
      matchedGroupName = groupName;
      break;
    }
  }
  
  if (hasAccess) {
    securityLogger.info('Sirius access GRANTED', { matchedGroupName, groupId: requiredGroupId });
    return { 
      hasAccess: true, 
      matchedGroupId: requiredGroupId,
      matchedGroupName: matchedGroupName
    };
  }
  
  // Log detailed failure information for debugging
  securityLogger.warn('Sirius access DENIED', {
    username: 'checking',
    requiredGroupId,
    userGroupIds,
    userGroupNames,
    message: 'User is not a member of the Sirius Users group'
  });
  
  return { hasAccess: false };
};

export const logSecurityEvent = (event: 'ACCESS_GRANTED' | 'ACCESS_DENIED' | 'AUTH_ATTEMPT', details: {
  username: string;
  groups?: string[];
  groupIds?: string[];
  matchedGroup?: string;
  matchedGroupId?: string;
  timestamp?: Date;
}): void => {
  const logData = {
    event,
    ...details,
    siriusGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID,
    timestamp: details.timestamp || new Date(),
    userAgent: navigator.userAgent,
    ip: 'client-side' // Note: Real IP would come from server
  };
  
  // Log security event using security logger
  securityLogger.security('Security Event', logData);
  
  // In production, this should be sent to a security audit service
  // Example: sendToAuditService(logData);
};