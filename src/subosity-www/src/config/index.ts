interface AppConfig {
  appUrl: string;
  baseUrl: string;
}

// Production defaults (always safe to deploy)
const PRODUCTION_CONFIG: AppConfig = {
  appUrl: 'https://app.subosity.com',
  baseUrl: 'https://subosity.com'
};

// Development overrides (only when explicitly set)
const DEVELOPMENT_OVERRIDES: Partial<AppConfig> = {
  // Only override if environment variables are explicitly set
  ...(process.env.GATSBY_APP_URL && { appUrl: process.env.GATSBY_APP_URL }),
  ...(process.env.GATSBY_BASE_URL && { baseUrl: process.env.GATSBY_BASE_URL }),
};

// Smart config that defaults to production, overrides for development
export const APP_CONFIG: AppConfig = {
  ...PRODUCTION_CONFIG,
  ...DEVELOPMENT_OVERRIDES
};

// Debug helper (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 App Config:', APP_CONFIG);
}

export type { AppConfig };
