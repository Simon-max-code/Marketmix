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
    URL: 'https://zfyoxmwwuwgvaevwlgzn.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmeW94bXd3dXdndmFldndsZ3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzIxNzIsImV4cCI6MjA3OTI0ODE3Mn0.k35O8K2mQyoI8T2PCI5RhInlaSTDMpwJ8xRw5zITL_0'
  }
};
