// src/hooks/usePageTitle.ts
import { useEffect } from 'react';
import { APP_CONFIG } from '@/config/app.config';

export interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string;
}

/**
 * Hook to manage page title and meta tags
 * Updates document title and meta tags for SEO
 */
export function usePageTitle(meta: PageMeta) {
  useEffect(() => {
    const defaultTitle = APP_CONFIG.name;
    const title = meta.title
      ? `${meta.title} - ${defaultTitle}`
      : defaultTitle;

    // Update document title
    document.title = title;

    // Update meta description
    if (meta.description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', meta.description);
    }

    // Update meta keywords
    if (meta.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', meta.keywords);
    }

    // Update Open Graph title
    if (meta.title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', title);
    }

    // Update Open Graph description
    if (meta.description) {
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', meta.description);
    }

    // Cleanup function to restore default title
    return () => {
      document.title = defaultTitle;
    };
  }, [meta.title, meta.description, meta.keywords]);
}

