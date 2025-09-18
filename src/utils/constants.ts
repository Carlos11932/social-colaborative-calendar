/**
 * Shared constants and configuration
 */

/**
 * CSS classes for language switcher buttons
 */
export const LANGUAGE_BUTTON_CLASSES = {
  active: 'text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded font-semibold',
  inactive: 'text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded',
  enButton: {
    active: 'text-xs text-blue-600 hover:text-blue-800 mr-2 px-2 py-1 rounded font-semibold',
    inactive: 'text-xs text-gray-400 hover:text-gray-600 mr-2 px-2 py-1 rounded'
  },
  esButton: {
    active: 'text-xs text-blue-600 hover:text-blue-800 ml-2 px-2 py-1 rounded font-semibold',
    inactive: 'text-xs text-gray-400 hover:text-gray-600 ml-2 px-2 py-1 rounded'
  }
};

/**
 * Common form validation rules
 */
export const VALIDATION_RULES = {
  password: {
    minLength: 6
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

/**
 * Common timeouts and delays
 */
export const TIMEOUTS = {
  redirectDelay: 2000,
  translationCheck: 10,
  successMessageDisplay: 1500
};

/**
 * Database table names
 */
export const DB_TABLES = {
  users: 'users'
};

/**
 * Route paths
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard'
};
