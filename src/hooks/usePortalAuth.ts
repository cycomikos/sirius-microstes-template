import { fetchUserGroups, createUserFromPortal } from '../utils/portalUtils';

// Keep the hook for backward compatibility with existing React components
export const usePortalAuth = () => {
  return {
    fetchUserGroups,
    createUserFromPortal
  };
};