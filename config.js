// Global Configuration for MarketMix Frontend
// Determine environment
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// API Configuration
const CONFIG = {
  // API Base URL - automatically switches based on environment
  API_BASE_URL: isDevelopment 
    ? 'http://localhost:5000/api'  // Local development
    : 'https://marketmix-backend.onrender.com/api',  // Production

  // Other settings
  APP_NAME: 'MarketMix',
  APP_VERSION: '1.0.0',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  
  // Storage keys
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user',
    USER_ROLE: 'userRole',
    CART: 'cart'
  },
  
  // Supabase Configuration
  SUPABASE: {
    URL: 'https://<YOUR-PROJECT-ID>.supabase.co',  // Replace with your Supabase URL
    KEY: '<YOUR-ANON-KEY>'  // Replace with your Supabase anon key
  }
};
