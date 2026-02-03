import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

/**
 * SEOHead component manages dynamic canonical URLs and other SEO meta tags.
 * Uses VITE_SITE_URL if set, otherwise falls back to window.location.origin.
 */
export function SEOHead() {
  const location = useLocation();
  
  // Get the base URL from environment or fallback to current origin
  const siteUrl = import.meta.env.VITE_SITE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'https://dalil.me');
  
  // Construct canonical URL for the current route
  const canonicalUrl = `${siteUrl}${location.pathname}`;
  
  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
