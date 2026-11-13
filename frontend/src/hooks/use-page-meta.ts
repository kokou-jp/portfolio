import { useEffect } from 'react';

interface PageMetaProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'Jean Paul — Développeur Full-Stack';
const DEFAULT_DESCRIPTION = 'Développeur Full-Stack passionné par la création d\'applications web modernes, performantes et évolutives.';

export function usePageMeta({
  title,
  description,
  image,
  canonical,
  noindex = false,
}: PageMetaProps) {
  useEffect(() => {
    const pageTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    document.title = pageTitle;

    if (description) {
      setMetaTag('description', description);
    }

    if (image) {
      setMetaTagProperty('og:image', image);
      setMetaTagProperty('og:image:alt', title || DEFAULT_TITLE);
    }

    setMetaTagProperty('og:title', pageTitle);
    setMetaTag('description', description || DEFAULT_DESCRIPTION);
    setMetaTagProperty('og:description', description || DEFAULT_DESCRIPTION);
    setMetaTagProperty('og:type', 'website');
    setMetaTagProperty('og:url', canonical || window.location.href);
    setMetaTagProperty('og:locale', 'fr_FR');
    setMetaTagProperty('twitter:card', 'summary_large_image');
    setMetaTagProperty('twitter:title', pageTitle);
    setMetaTagProperty('twitter:description', description || DEFAULT_DESCRIPTION);

    if (canonical) {
      setCanonical(canonical);
    }

    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
    }
  }, [title, description, image, canonical, noindex]);
}

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setMetaTagProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}
