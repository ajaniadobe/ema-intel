/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero. Base: hero (Author Kit native block).
 * Source: https://www.intel.com/content/www/us/en/gaming/serious-gaming.html
 * Selectors from captured DOM: section.ihp-hero-full-bleed
 *
 * Target structure (from block library):
 * | hero |
 * | background-image |
 * | heading + description + CTA |
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: Background image
  const bgImg = element.querySelector('.ihp-hero-full-bleed__media img');
  if (bgImg) {
    cells.push([bgImg]);
  }

  // Row 2: Content (heading + description + optional CTA)
  const contentCell = [];
  const heading = element.querySelector('.ihp-hero-full-bleed__header, h1');
  const description = element.querySelector('.ihp-hero-full-bleed__copy, .ihp-hero-full-bleed__content p');
  const cta = element.querySelector('.ihp-hero-full-bleed__content a.btn, .ihp-hero-full-bleed__content a.cta');

  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  if (cta) contentCell.push(cta);

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
