/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-quicklinks. Base: cards.
 * Source: https://www.intel.com/content/www/us/en/homepage.html
 * Selectors from captured DOM: div.cmp-tiles-info__items
 *
 * Target structure (from block library):
 * | cards-quicklinks |
 * | icon-image | label-link |
 * | icon-image | label-link |
 * ...
 * 2 columns: icon in col 1, linked label in col 2.
 */
export default function parse(element, { document }) {
  const tiles = element.querySelectorAll('.cmp-tiles-info__item');
  const cells = [];

  tiles.forEach((tile) => {
    const button = tile.querySelector('a.cmp-button');
    if (!button) return;

    // Col 1: Icon (from CSS class-based icon span — create placeholder image)
    const iconSpan = button.querySelector('.cmp-button__icon');
    let iconCell = '';
    if (iconSpan) {
      // Extract icon name from class (e.g., cmp-button__icon--download → download)
      const iconClass = [...iconSpan.classList].find((c) => c.startsWith('cmp-button__icon--'));
      const iconName = iconClass ? iconClass.replace('cmp-button__icon--', '') : 'icon';
      const img = document.createElement('img');
      img.src = `/icons/${iconName}.svg`;
      img.alt = iconName;
      iconCell = img;
    }

    // Col 2: Linked label text
    const labelSpan = button.querySelector('.cmp-button__text');
    const link = document.createElement('a');
    link.href = button.href;
    link.textContent = labelSpan ? labelSpan.textContent.trim() : button.textContent.trim();

    cells.push([iconCell, [link]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quicklinks', cells });
  element.replaceWith(block);
}
