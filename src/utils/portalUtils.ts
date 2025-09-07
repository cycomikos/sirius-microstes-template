import Portal from '@arcgis/core/portal/Portal';
import PortalGroup from '@arcgis/core/portal/PortalGroup';
import { User } from '../types/auth';
import { SECURITY_CONFIG } from '../constants';

// Method to directly check if user can access the Sirius Users group
export const checkSiriusGroupDirectly = async (portal: Portal): Promise<boolean> => {
  try {
    if (!portal.user) {
      return false;
    }

    console.log('🔍 Checking Sirius group directly:', SECURITY_CONFIG.REQUIRED_GROUP_ID);
    
    // Try to fetch the specific Sirius Users group
    const groupUrl = `${portal.url}/sharing/rest/community/groups/${SECURITY_CONFIG.REQUIRED_GROUP_ID}`;
    const token = portal.credential?.token;
    
    if (!token) {
      console.warn('No token available for direct group check');
      return false;
    }
    
    const params = new URLSearchParams({
      f: 'json',
      token: token
    });

    const response = await fetch(`${groupUrl}?${params}`);
    const groupData = await response.json();
    
    console.log('📋 Direct group check result:', groupData);
    
    // If we can access the group data and it exists, the user has access
    if (groupData && groupData.id === SECURITY_CONFIG.REQUIRED_GROUP_ID && !groupData.error) {
      console.log('✅ Direct group access confirmed for:', groupData.title);
      return true;
    }
    
    if (groupData.error) {
      console.warn('Direct group check error:', groupData.error.message);
    }
    
    return false;
  } catch (error) {
    console.warn('Direct group check failed:', error);
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
    const token = portal.credential?.token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log('🔍 Trying REST API method for user:', username);
    
    // Use the REST API directly to get user's groups
    const restUrl = `${portal.url}/sharing/rest/community/users/${username}`;
    const params = new URLSearchParams({
      f: 'json',
      token: token
    });

    const response = await fetch(`${restUrl}?${params}`);
    const userData = await response.json();
    
    console.log('📋 REST API user data:', userData);
    
    if (userData.error) {
      throw new Error(`REST API error: ${userData.error.message}`);
    }

    const groupIds: string[] = [];
    const groupNames: string[] = [];
    
    // Extract groups from user data
    if (userData.groups && Array.isArray(userData.groups)) {
      userData.groups.forEach((groupId: string) => {
        groupIds.push(groupId);
        console.log(`  - Group ID from REST: ${groupId}`);
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
          console.log(`  - Group: ${groupData.title} (${groupId})`);
        } else {
          groupNames.push('Unknown Group');
        }
      } catch (groupError) {
        console.warn(`Failed to fetch details for group ${groupId}:`, groupError);
        groupNames.push('Unknown Group');
      }
    }
    
    console.log('📊 REST API found:', groupIds.length, 'groups');
    return { groupIds, groupNames };
    
  } catch (error) {
    console.error('❌ REST API method failed:', error);
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
    
    console.log('🔍 Fetching groups for user:', username);
    
    // Method 1: Try to get groups directly from the portal user object
    if (portal.user.groups && portal.user.groups.length > 0) {
      console.log('📋 Found groups in portal.user.groups:', portal.user.groups.length);
      portal.user.groups.forEach(group => {
        groupIds.push(group.id);
        groupNames.push(group.title);
        console.log(`  - Group: ${group.title} (${group.id})`);
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
      
      console.log('🔍 Member query found:', groupQuery.results.length, 'groups');
      
      // Add group IDs and names (avoid duplicates)
      groupQuery.results.forEach(group => {
        if (!groupIds.includes(group.id)) {
          groupIds.push(group.id);
          groupNames.push(group.title);
          console.log(`  + Member of: ${group.title} (${group.id})`);
        }
      });
    } catch (memberQueryError) {
      console.warn('⚠️ Member query failed:', memberQueryError);
    }
    
    // Method 3: Query for groups the user owns
    try {
      const ownedGroupQuery = await portal.queryGroups({
        query: `owner:${username}`,
        sortField: 'title' as const,
        sortOrder: 'asc' as const,
        num: 100
      });
      
      console.log('🔍 Owner query found:', ownedGroupQuery.results.length, 'groups');
      
      // Add owned groups (avoid duplicates)
      ownedGroupQuery.results.forEach(group => {
        if (!groupIds.includes(group.id)) {
          groupIds.push(group.id);
          groupNames.push(group.title);
          console.log(`  + Owner of: ${group.title} (${group.id})`);
        }
      });
    } catch (ownerQueryError) {
      console.warn('⚠️ Owner query failed:', ownerQueryError);
    }
    
    console.log('📊 Total groups found:', groupIds.length);
    console.log('🎯 Looking for Sirius Users group ID:', SECURITY_CONFIG.REQUIRED_GROUP_ID);
    console.log('✅ User has Sirius access:', groupIds.includes(SECURITY_CONFIG.REQUIRED_GROUP_ID));
    
    return { groupIds, groupNames };
  } catch (groupError) {
    console.error('❌ Error fetching user groups:', groupError);
    return { groupIds: [], groupNames: [] };
  }
};

export const createUserFromPortal = async (portal: Portal, token: string): Promise<User> => {
  const user = portal.user;
  if (!user) {
    throw new Error('User not found in portal');
  }

  console.log('👤 Creating user from portal for:', user.username);
  
  // Try multiple methods to get user groups
  let groupIds: string[] = [];
  let groupNames: string[] = [];
  
  // Method 1: Standard approach
  const standardResult = await fetchUserGroups(portal, user.username);
  groupIds = standardResult.groupIds;
  groupNames = standardResult.groupNames;
  
  // Method 2: If standard approach didn't find the required group, try REST API
  if (!groupIds.includes(SECURITY_CONFIG.REQUIRED_GROUP_ID)) {
    console.log('⚠️ Standard method didn\'t find Sirius Users group, trying REST API...');
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
    console.log('⚠️ Still no Sirius group found, trying direct group check...');
    const hasDirectAccess = await checkSiriusGroupDirectly(portal);
    
    if (hasDirectAccess) {
      console.log('✅ Direct access confirmed - adding Sirius group to user groups');
      groupIds.push(SECURITY_CONFIG.REQUIRED_GROUP_ID);
      groupNames.push(SECURITY_CONFIG.REQUIRED_GROUP_NAME);
    }
  }
  
  console.log('📊 Final user groups:', {
    totalGroups: groupIds.length,
    hasSiriusAccess: groupIds.includes(SECURITY_CONFIG.REQUIRED_GROUP_ID),
    siriusGroupId: SECURITY_CONFIG.REQUIRED_GROUP_ID
  });

  return {
    username: user.username,
    fullName: user.fullName || user.username,
    groups: groupNames, // Keep names for backward compatibility
    groupIds: groupIds, // Add group IDs for secure validation
    token
  };
};

export const validateSiriusAccess = (userGroupIds: string[], userGroupNames?: string[]): { hasAccess: boolean; matchedGroupId?: string; matchedGroupName?: string } => {
  console.log('🔍 Validating Sirius access...');
  console.log('User group IDs:', userGroupIds);
  console.log('User group names:', userGroupNames);
  console.log('Required group ID:', SECURITY_CONFIG.REQUIRED_GROUP_ID);
  
  // Primary validation using group IDs (more secure)
  const allowedGroupIds = [SECURITY_CONFIG.REQUIRED_GROUP_ID, ...SECURITY_CONFIG.ALLOWED_ALTERNATIVE_GROUP_IDS];
  console.log('Allowed group IDs:', allowedGroupIds);
  
  for (const groupId of allowedGroupIds) {
    console.log(`Checking for group ID: ${groupId}`);
    if (userGroupIds.includes(groupId)) {
      // Find the corresponding group name for logging
      const groupIndex = userGroupIds.indexOf(groupId);
      const matchedGroupName = userGroupNames?.[groupIndex] || 
        (groupId === SECURITY_CONFIG.REQUIRED_GROUP_ID ? SECURITY_CONFIG.REQUIRED_GROUP_NAME : 'Unknown Group');
      
      console.log('✅ Access granted! Matched group:', matchedGroupName, `(${groupId})`);
      return { 
        hasAccess: true, 
        matchedGroupId: groupId,
        matchedGroupName: matchedGroupName
      };
    }
  }
  
  console.log('❌ Access denied - no matching group found');
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
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('Security Event:', logData);
  }
  
  // In production, this should be sent to a security audit service
  // Example: sendToAuditService(logData);
};