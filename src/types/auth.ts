export interface User {
  username: string;
  fullName: string;
  groups: string[];
  token: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface RoutePermission {
  groups?: string[];
  requiresAuth?: boolean;
}