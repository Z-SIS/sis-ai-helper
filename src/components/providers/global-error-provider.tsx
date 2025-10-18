'use client';

import { useEffect } from 'react';

export function GlobalErrorProvider() {
  useEffect(() => {
    // Import the global error handler only on the client side
    import('@/lib/global-error-handler');
  }, []);

  return null;
}