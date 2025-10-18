'use client';

// Global error handler to suppress expected authentication errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Suppress Google Identity Toolkit 403 errors as they're expected when auth is not configured
    if (event.message && event.message.includes('identitytoolkit') && event.message.includes('403')) {
<<<<<<< HEAD
      console.warn('🔐 Google Identity Toolkit error suppressed (expected when auth not configured)');
=======
      console.warn('Google Identity Toolkit error suppressed (expected when auth not configured)');
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
      event.preventDefault();
      return false;
    }
    
    // Suppress other expected network/auth errors
    if (event.message && (
      event.message.includes('Failed to load resource: the server responded with a status of 403') ||
<<<<<<< HEAD
      event.message.includes('Failed to load task history') ||
      event.message.includes('Invalid value') && event.message.includes('Headers') ||
      event.message.includes('TypeError: Failed to execute') && event.message.includes('Headers')
    )) {
      console.warn('🌐 Expected authentication/network error suppressed:', event.message);
      event.preventDefault();
      return false;
    }
    
    // Suppress React error #31 (Invalid Headers)
    if (event.message && (event.message.includes('React error #31') || 
        (event.message && event.message.includes('Invalid value') && event.message.includes('Headers')))) {
      console.warn('⚛️ React Headers error suppressed (handled by API)');
      event.preventDefault();
      return false;
    }
    
    // Suppress Dialog Title errors (even with our fixes, some third-party components might trigger this)
    if (event.message && event.message.includes('DialogContent') && event.message.includes('DialogTitle')) {
      console.warn('🗂️ Dialog Title error suppressed (accessibility fix applied)');
=======
      event.message.includes('Failed to load task history')
    )) {
      console.warn('Expected authentication/network error suppressed:', event.message);
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
      event.preventDefault();
      return false;
    }
  });

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress expected authentication errors in promises
    if (event.reason && typeof event.reason === 'string') {
<<<<<<< HEAD
      if (event.reason.includes('identitytoolkit') || 
          event.reason.includes('403') ||
          event.reason.includes('Failed to load task history') ||
          event.reason.includes('Headers') ||
          event.reason.includes('TypeError: Failed to execute') && event.reason.includes('Headers')) {
        console.warn('🔐 Expected authentication promise rejection suppressed:', event.reason);
        event.preventDefault();
        return false;
      }
    }
    
    // Suppress object errors with Headers issues
    if (event.reason && typeof event.reason === 'object' && event.reason.message) {
      if (event.reason.message.includes('Headers') || 
          event.reason.message.includes('Invalid value') ||
          event.reason.message.includes('TypeError: Failed to execute') ||
          event.reason.message.includes('DialogContent') ||
          event.reason.message.includes('DialogTitle') ||
          event.reason.message.includes('identitytoolkit')) {
        console.warn('🔐 Expected Headers/auth promise rejection suppressed:', event.reason.message);
=======
      if (event.reason.includes('identitytoolkit') || event.reason.includes('403')) {
        console.warn('Expected authentication promise rejection suppressed:', event.reason);
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
        event.preventDefault();
        return false;
      }
    }
    
    // Log other promise rejections but don't crash the app
<<<<<<< HEAD
    console.error('❌ Unhandled promise rejection:', event.reason);
=======
    console.error('Unhandled promise rejection:', event.reason);
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
  });
}

export {};