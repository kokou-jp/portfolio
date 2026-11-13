import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/#')) {
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL || '/api'}/page-views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        page_path: path,
        referer: document.referrer,
      }),
    }).catch(() => {});
  }, [location]);
}

