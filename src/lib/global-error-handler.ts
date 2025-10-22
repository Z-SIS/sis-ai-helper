'use client';

// Global error handler to suppress expected authentication errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Suppress Google Identity Toolkit 403 errors as they're expected when auth is not configured
    if (event.message && event.message.includes('identitytoolkit') && event.message.includes('403')) {
      console.warn('Google Identity Toolkit error suppressed (expected when auth not configured)');
      event.preventDefault();
      return false;
    }
    
    // Suppress other expected network/auth errors
    if (event.message && (
      event.message.includes('Failed to load resource: the server responded with a status of 403') ||
      event.message.includes('Failed to load task history')
    )) {
      console.warn('Expected authentication/network error suppressed:', event.message);
      event.preventDefault();
      return false;
    }
  });

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress expected authentication errors in promises
    if (event.reason && typeof event.reason === 'string') {
      if (event.reason.includes('identitytoolkit') || event.reason.includes('403')) {
        console.warn('Expected authentication promise rejection suppressed:', event.reason);
        event.preventDefault();
        return false;
      }
    }
    
    // Log other promise rejections but don't crash the app
    console.error('Unhandled promise rejection:', event.reason);
  });
}

export {};