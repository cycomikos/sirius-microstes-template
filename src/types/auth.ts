export interface User {
  username: string;
  fullName: string;
  groups: string[]; // Group names (for backward compatibility)
  groupIds?: string[]; // Group IDs (for secure validation)
  token: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  accessDenied: { message: string; userGroups?: string[]; userGroupIds?: string[] } | null;
}

export interface RoutePermission {
  groups?: string[];
  requiresAuth?: boolean;
}