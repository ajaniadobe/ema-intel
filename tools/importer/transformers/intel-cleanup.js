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
