/* eslint-disable */
/* global WebImporter */

/**
 * Parser for retailer-locator (stub block).
 * Source: https://www.intel.com/content/www/us/en/gaming/serious-gaming.html
 * Selectors from captured DOM: div.linklist.section
 *
 * EXCLUDED functionality — replaces shop dropdown with placeholder stub.
 * Target: single cell with placeholder heading and text.
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('h2');
  const headingText = heading ? heading.textContent.trim() : 'Where to Buy';

  const h = document.createElement('h2');
  h.textContent = headingText;

  const p = document.createElement('p');
  p.textContent = 'Retailer locator coming soon. Visit intel.com/buy for current options.';

  const cells = [[h, p]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'retailer-locator', cells });
  element.replaceWith(block);
}
