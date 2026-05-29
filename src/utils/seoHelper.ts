import { Project } from '../services/projectService';

/**
 * Dynamically updates document head with SEO elements optimized for individual projects:
 * 1. Meta Description
 * 2. Meta Keywords (extracted from title, category, and tech stack)
 * 3. Canonical Link URL
 * 4. Structured JSON-LD Data (SoftwareApplication schema)
 */
export const updateDynamicProjectSEO = (project: Project, origin: string): void => {
  if (!project) return;

  try {
    const canonicalUrl = `${origin}?project=${project.id}`;

    // 1. Title is handled by App.tsx, but we can set or guarantee it here
    document.title = `${project.title} — Elite Craftsmanship | Nishkalya Studio`;

    // 2. Dynamic description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    const descriptionText = project.desc || `Technical details, architecture design and custom software realization of ${project.title} developed by Nishkalya Studio.`;
    descMeta.setAttribute('content', descriptionText);

    // 3. Dynamic keywords extraction combining title, category and technical stack roles
    let keywordsMeta = document.querySelector('meta[name="keywords"]#dynamic-seo-keywords') as HTMLMetaElement | null;
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      keywordsMeta.setAttribute('id', 'dynamic-seo-keywords');
      document.head.appendChild(keywordsMeta);
    }

    const techKeywords = project.fullDetails?.techStack?.map(tech => tech.name) || [];
    const keywordsList = [
      project.title,
      project.category,
      'Nishkalya Studio',
      'AI-First Digital Ecosystem',
      'Software Architecture',
      'React Design Systems',
      ...techKeywords
    ].filter((val, index, self) => val && self.indexOf(val) === index); // unique and truthy

    keywordsMeta.setAttribute('content', keywordsList.join(', '));

    // 4. Canonical Link Tag alignment
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 5. Open Graph matching overrides
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${project.title} — Technical Showcase`);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', descriptionText);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    // 6. Structured JSON-LD injection
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]#dynamic-seo-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('id', 'dynamic-seo-jsonld');
      document.head.appendChild(jsonLdScript);
    }

    // Build standard rich SoftwareApplication / CreativeWork JSON-LD structure
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': project.title,
      'description': descriptionText,
      'applicationCategory': project.category,
      'url': canonicalUrl,
      'operatingSystem': 'All',
      'softwareVersion': '1.0.0',
      'author': {
        '@type': 'Organization',
        'name': 'Nishkalya Studio',
        'url': origin
      },
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      ...(project.fullDetails?.features ? {
        'featureList': project.fullDetails.features.join(', ')
      } : {})
    };

    jsonLdScript.textContent = JSON.stringify(jsonLdData, null, 2);

  } catch (error) {
    console.warn('Silent SEO metadata update bypass failed:', error);
  }
};

/**
 * Resets document dynamic SEO attributes back to defaults when no specific project preview is active.
 */
export const clearDynamicProjectSEO = (): void => {
  try {
    // 1. Remove dynamically injected keywords elements
    const keywordsMeta = document.getElementById('dynamic-seo-keywords');
    if (keywordsMeta) {
      keywordsMeta.remove();
    }

    // 2. Remove JSON-LD scripts
    const jsonLdScript = document.getElementById('dynamic-seo-jsonld');
    if (jsonLdScript) {
      jsonLdScript.remove();
    }
  } catch (error) {
    console.warn('Dynamic project SEO cleanup bypass failed:', error);
  }
};
