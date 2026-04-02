/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.intel.com/content/www/us/en/gaming/serious-gaming.html
 * Selectors from captured DOM: div.twoColumn.section (fifty-fifty), div.promotions.section
 *
 * Target structure (from block library):
 * | cards-product |
 * | image | heading + description + CTA |
 * | image | heading + description + CTA |
 */
export default function parse(element, { document }) {
  const cells = [];

  // Pattern 1: Two-column layout (Gaming Desktops / Gaming Laptops)
  const twoColItems = element.querySelectorAll('.twocolumnpar-one, .twocolumnpar-two');
  if (twoColItems.length > 0) {
    twoColItems.forEach((item) => {
      const img = item.querySelector('.atom-image img, img');
      const heading = item.querySelector('h3 a, h3');
      const desc = item.querySelector('.a-text p');
      const cta = item.querySelector('.a-text a');

      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (desc && desc !== cta?.closest('p')) contentCell.push(desc);
      if (cta) contentCell.push(cta);

      cells.push([img || '', contentCell]);
    });
  }

  // Pattern 2: Promotions blade (Explore Intel PC Gaming Products)
  const promoItems = element.querySelectorAll('.blade-item.promotions-item');
  if (promoItems.length > 0) {
    promoItems.forEach((item) => {
      const img = item.querySelector('.blade-image img, figure img');
      const heading = item.querySelector('.blade-item-heading a, .blade-item-heading');
      const desc = item.querySelector('.blade-item-content p');

      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (desc) contentCell.push(desc);

      cells.push([img || '', contentCell]);
    });
  }

  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
    element.replaceWith(block);
  }
}
