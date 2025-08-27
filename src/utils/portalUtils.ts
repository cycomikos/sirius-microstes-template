import Portal from '@arcgis/core/portal/Portal';
import { User } from '../types/auth';

export const fetchUserGroups = async (portal: Portal, username: string): Promise<string[]> => {
  try {
    const queryParams = {
      q: `owner:${username}`,
      sortField: 'title' as const,
      sortOrder: 'asc' as const
    };
    const groupQuery = await portal.queryGroups(queryParams);
    return groupQuery.results.map(group => group.title);
  } catch (groupError) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Could not fetch user groups:', groupError);
    }
    return [];
  }
};

export const createUserFromPortal = async (portal: Portal, token: string): Promise<User> => {
  const user = portal.user;
  if (!user) {
    throw new Error('User not found in portal');
  }

  const groups = await fetchUserGroups(portal, user.username);

  return {
    username: user.username,
    fullName: user.fullName || user.username,
    groups,
    token
  };
};