/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-resource. Base: cards (no images).
 * Source: https://www.intel.com/content/www/us/en/gaming/serious-gaming.html
 * Selectors from captured DOM: div.simpleCard.section
 *
 * Target structure (from block library, no-images variant):
 * | cards-resource |
 * | title-link |
 * | title-link |
 * ...
 * Single column per row, each card is just a linked title.
 */
export default function parse(element, { document }) {
  const cards = element.querySelectorAll('.simple-card-item');
  const cells = [];

  cards.forEach((card) => {
    const link = card.querySelector('a.content, .body a');
    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      cells.push([[a]]);
    }
  });

  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells });
    element.replaceWith(block);
  }
}
