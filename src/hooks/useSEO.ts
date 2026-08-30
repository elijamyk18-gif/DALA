import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description?: string;
  canonicalPath?: string; // e.g. '/about' - defaults to '/'
}

const SITE_URL = 'https://dala.home.kg';

/**
 * Sets the document title, meta description, and canonical link for the
 * current page, restoring the previous values when the page unmounts.
 * This keeps every route's SEO tags accurate instead of all pages sharing
 * the same default tags from index.html.
 */
export function useSEO({ title, description, canonicalPath = '/' }: SEOOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let metaDescription: HTMLMetaElement | null = null;
    let prevDescriptionContent: string | null = null;
    if (description) {
      metaDescription = document.querySelector('meta[name="description"]');
      prevDescriptionContent = metaDescription?.getAttribute('content') ?? null;
      metaDescription?.setAttribute('content', description);
    }

    // Canonical link
    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonicalHref = canonicalEl?.getAttribute('href') ?? null;
    const createdCanonical = !canonicalEl;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', `${SITE_URL}${canonicalPath}`);

    return () => {
      document.title = prevTitle;
      if (metaDescription && prevDescriptionContent !== null) {
        metaDescription.setAttribute('content', prevDescriptionContent);
      }
      if (canonicalEl) {
        if (createdCanonical) {
          canonicalEl.remove();
        } else if (prevCanonicalHref !== null) {
          canonicalEl.setAttribute('href', prevCanonicalHref);
        }
      }
    };
  }, [title, description, canonicalPath]);
}
