// Environment configuration using Vite
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  
  // App Information
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Saham Trading Platform',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Domain Configuration
  DOMAIN: import.meta.env.VITE_DOMAIN || 'localhost:3000',
  
  // Contact Information
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@sahamtradingplc.com',
  TELEGRAM_CHANNEL: import.meta.env.VITE_TELEGRAM_CHANNEL || 'https://t.me/sahamtradingofficial',
  COMPANY_PHONE: import.meta.env.VITE_COMPANY_PHONE || '+251900280080',
  COMPANY_ADDRESS: import.meta.env.VITE_COMPANY_ADDRESS || 'Addis Ababa, Ethiopia',
  
  // Computed values
  IS_PRODUCTION: import.meta.env.VITE_ENVIRONMENT === 'production',
  IS_DEVELOPMENT: import.meta.env.VITE_ENVIRONMENT === 'development',
  
  // URLs
  BASE_URL: import.meta.env.VITE_ENVIRONMENT === 'production' 
    ? `http://${import.meta.env.VITE_DOMAIN}` 
    : `https://${import.meta.env.VITE_DOMAIN}`,
    
  // Referral URL generator
  getReferralUrl: (referralCode: string) => {
    const baseUrl = import.meta.env.VITE_ENVIRONMENT === 'production' 
      ? `http://${import.meta.env.VITE_DOMAIN}` 
      : `https://${import.meta.env.VITE_DOMAIN}`;
    return `${baseUrl}/register?ref=${referralCode}`;
  }
};

// Type definitions for better TypeScript support
export interface EnvConfig {
  API_BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  ENVIRONMENT: string;
  DOMAIN: string;
  SUPPORT_EMAIL: string;
  TELEGRAM_CHANNEL: string;
  COMPANY_PHONE: string;
  COMPANY_ADDRESS: string;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
  BASE_URL: string;
  getReferralUrl: (referralCode: string) => string;
}

// Export default configuration
export default env;