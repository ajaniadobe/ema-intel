/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Intel site cleanup.
 * Selectors from captured DOM of intel.com homepage.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent and overlays (from captured DOM: OneTrust banner)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="onetrust"]',
      '[id*="CookiebotDialog"]',
    ]);

    // Intel.com pages have <main id="primary-content"> as a direct child of body.
    // Everything else (header, footer, breadcrumbs, scripts) are siblings.
    // Keep only the <main> content to avoid importing site chrome.
    const mainEl = element.querySelector('main#primary-content, main');
    if (mainEl) {
      // Move all main's children into body, remove everything else
      const children = [...element.children];
      children.forEach((child) => {
        if (child !== mainEl) {
          child.remove();
        }
      });
      // Unwrap main: move its children to body level
      while (mainEl.firstChild) {
        element.appendChild(mainEl.firstChild);
      }
      mainEl.remove();
    }

    // Also remove the source site's embedded footer content
    // (class="global blade solid brand-lighter-gray" footer inside content area)
    WebImporter.DOMUtils.remove(element, [
      'footer.global',
      'footer[id="skip-footer"]',
      '.get-help-blade',
      'div.get-help',
    ]);

    // Remove <link> stylesheet elements inside <main> that become text in serialized output
    element.querySelectorAll('link[rel="stylesheet"]').forEach((link) => link.remove());

    // Remove "Get Help" toggler button/span from Intel.com content area
    element.querySelectorAll('.navbar-toggler-title').forEach((span) => {
      if (span.textContent.trim() === 'Get Help') {
        const btn = span.closest('button') || span.closest('.get-help');
        if (btn) btn.remove();
        else span.remove();
      }
    });

    // Remove Intel.com's "get-help" footer section that appears inside main content
    element.querySelectorAll('[class*="get-help"]').forEach((el) => el.remove());

    // Remove Intel.com commons-page and campaign CSS/JS references embedded in content
    element.querySelectorAll('link[href*="clientlibs"], script[src*="clientlibs"]').forEach((el) => el.remove());

    // Remove inline <script> blocks (CQ_Analytics, etc.)
    element.querySelectorAll('script').forEach((s) => {
      if (!s.src) s.remove();
    });
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      'header.ighf-h',
      'footer.ighf-h__footer',
      'div.skip-to-main',
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      'noscript',
      'iframe',
      'link',
    ]);

    // Remove Intel.com source navigation, search, language selector, and footer
    // that get scraped as page content on non-homepage templates.

    // Remove "Skip To Main Content" link
    element.querySelectorAll('a[href="#primary-content"]').forEach((a) => {
      const p = a.closest('p');
      if (p) p.remove();
    });

    // Remove source header logo (intel-header-logo.svg)
    element.querySelectorAll('img[alt*="Intel logo - Return"]').forEach((img) => {
      const p = img.closest('p') || img.closest('a')?.closest('p');
      if (p) p.remove();
    });

    // Remove "Toggle Navigation" text
    element.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim() === 'Toggle Navigation') p.remove();
    });

    // Remove the full mega-menu navigation list (Products, Support, Solutions...)
    // It appears as an <ol> with nav items containing sub-lists
    element.querySelectorAll('ol').forEach((ol) => {
      const items = ol.querySelectorAll(':scope > li');
      if (items.length > 0) {
        const firstText = items[0].textContent?.trim() || '';
        if (firstText.startsWith('Products')) {
          ol.remove();
        }
      }
    });

    // Remove "Sign In My Intel", "My Tools", "Sign Out" paragraphs
    element.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (/^Sign In My Intel$|^My Tools$|^Sign Out$|^English$|^Toggle Search$|^close$|^Search$|^Feedback$|^ChatBot Btn$|^Expand$|^Collapse$/.test(text)
        || text.startsWith('Search ') && text.includes('Search Intel.com')
        || text === '?') {
        p.remove();
      }
    });

    // Remove standalone "?" list items
    element.querySelectorAll('li').forEach((li) => {
      if (li.textContent.trim() === '?' && li.children.length === 0) li.remove();
    });

    // Remove "Select Your Language" heading and associated language lists
    element.querySelectorAll('h2').forEach((h2) => {
      if (h2.textContent.trim() === 'Select Your Language') {
        // Remove up to 2 sibling <ul> elements that follow (language lists)
        let sibling = h2.nextElementSibling;
        let removed = 0;
        while (sibling && removed < 2) {
          const next = sibling.nextElementSibling;
          if (sibling.tagName === 'UL') {
            sibling.remove();
            removed++;
          } else {
            break;
          }
          sibling = next;
        }
        h2.remove();
      }
    });

    // Remove search panel content (Using Intel.com Search, Quick Links, etc.)
    ['Using Intel.com Search', 'Quick Links', 'Recent Searches', 'Advanced Search', 'Only search in'].forEach((text) => {
      element.querySelectorAll('h3').forEach((h3) => {
        if (h3.textContent.trim() === text) {
          // Remove heading and following content until next heading or section break
          let sibling = h3.nextElementSibling;
          while (sibling && !['H1', 'H2', 'H3', 'DIV'].includes(sibling.tagName)) {
            const next = sibling.nextElementSibling;
            sibling.remove();
            sibling = next;
          }
          h3.remove();
        }
      });
    });

    // Remove "Sign In to access restricted content" paragraphs
    element.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim().match(/^Sign [Ii]n\s+to access restricted content\.?$/)) {
        p.remove();
      }
    });

    // Remove browser upgrade warning
    element.querySelectorAll('p').forEach((p) => {
      if (p.textContent.includes('browser version you are using is not recommended')) {
        // Also remove the following browser list
        const next = p.nextElementSibling;
        if (next && next.tagName === 'UL') {
          const browsers = next.querySelectorAll('a');
          const isBrowserList = [...browsers].some((a) => /Safari|Chrome|Edge|Firefox/.test(a.textContent));
          if (isBrowserList) next.remove();
        }
        p.remove();
      }
    });

    // Remove source site footer elements that appear in content
    // "Get Help" text followed by stylesheet link and company/social links
    element.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (text === 'Get Help') p.remove();
      // Remove inline <link> and <script> tags rendered as text
      if (text.startsWith('<link rel="stylesheet"') || text.startsWith('<script')) p.remove();
    });

    // Remove source footer: company links list (Company Overview, Contact Intel, etc.)
    element.querySelectorAll('ul').forEach((ul) => {
      const links = ul.querySelectorAll('a');
      if (links.length >= 5) {
        const hrefs = [...links].map((a) => a.getAttribute('href') || '');
        if (hrefs.some((h) => h.includes('company-overview')) && hrefs.some((h) => h.includes('newsroom'))) {
          ul.remove();
        }
      }
    });

    // Remove source footer: social media links list
    element.querySelectorAll('ul').forEach((ul) => {
      const links = ul.querySelectorAll('a');
      if (links.length >= 3) {
        const hrefs = [...links].map((a) => a.getAttribute('href') || '');
        if (hrefs.some((h) => h.includes('facebook.com/Intel')) && hrefs.some((h) => h.includes('twitter.com/intel'))) {
          ul.remove();
        }
      }
    });

    // Remove source footer: legal links list (Terms of Use, Trademarks, etc.)
    element.querySelectorAll('ul').forEach((ul) => {
      const links = ul.querySelectorAll('a');
      if (links.length >= 4) {
        const hrefs = [...links].map((a) => a.getAttribute('href') || '');
        if (hrefs.some((h) => h.includes('terms-of-use')) && hrefs.some((h) => h.includes('trademarks'))) {
          ul.remove();
        }
      }
    });

    // Remove source footer: legal disclaimer paragraph
    element.querySelectorAll('p').forEach((p) => {
      if (p.textContent.includes('Intel technologies may require enabled hardware')) {
        p.remove();
      }
    });

    // Remove source footer logo
    element.querySelectorAll('img[alt="Intel Footer Logo"]').forEach((img) => {
      const p = img.closest('p') || img.closest('a')?.closest('p');
      if (p) p.remove();
    });

    // Remove javascript:void() links
    element.querySelectorAll('a[href="javascript:void();"]').forEach((a) => {
      const p = a.closest('p');
      if (p) p.remove();
    });

    // Clean tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-link-accessibility-enabled');
      el.removeAttribute('data-cmp-link-accessibility-text');
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
    });

    // Fix /content paths in links to remove /content/www/us/en prefix
    element.querySelectorAll('a[href*="/content/www/"]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href) {
        a.setAttribute('href', href.replace(/\/content\/www\/us\/en\//g, '/'));
      }
    });
  }
}
