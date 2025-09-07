export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
} as const;

export const SESSION_CONFIG = {
  TIMEOUT: 30 * 60 * 1000, // 30 minutes
  ACTIVITY_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
  WARNING_THRESHOLD: 5 * 60 * 1000 // 5 minutes before expiry
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  REQUIRED_GROUP_ID: 'afa4ae2949554ec59972abebbfd0034c', // Sirius Users group ID
  REQUIRED_GROUP_NAME: 'Sirius Users', // For display purposes only
  ALLOWED_ALTERNATIVE_GROUP_IDS: [], // Add backup group IDs if needed
  ENFORCE_GROUP_CHECK: true,
  // Group validation intervals
  GROUP_CHECK_INTERVAL: 5 * 60 * 1000, // Check every 5 minutes
  GROUP_CHECK_ON_FOCUS: true, // Check when window regains focus
  GROUP_CHECK_ON_ACTIVITY: true, // Check on user activity after idle period
  IDLE_THRESHOLD: 10 * 60 * 1000 // Consider idle after 10 minutes
} as const;

export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  MAX_TEXT_LENGTH: 255
} as const;

export const VALIDATION_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
  SEARCH_QUERY_MAX: 100,
  EMAIL_MAX: 254
} as const;

export const APP_CONFIG = {
  VERSION: '1.0.0',
  APP_NAME: 'SIRIUS Portal',
  APP_DESCRIPTION: 'Enterprise GIS Platform'
} as const;