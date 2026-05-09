/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  
  // App Information
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENVIRONMENT: string;
  
  // Domain Configuration
  readonly VITE_DOMAIN: string;
  
  // Contact Information
  readonly VITE_SUPPORT_EMAIL: string;
  readonly VITE_TELEGRAM_CHANNEL: string;
  readonly VITE_COMPANY_PHONE: string;
  readonly VITE_COMPANY_ADDRESS: string;
  
  // Legacy React App Variables (for compatibility)
  readonly REACT_APP_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global constants defined in vite.config.ts
declare const __APP_VERSION__: string;
declare const __APP_NAME__: string;