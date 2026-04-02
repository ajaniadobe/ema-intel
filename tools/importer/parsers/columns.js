/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns. Base: columns (Author Kit native block).
 * Source: https://www.intel.com/content/www/us/en/gaming/serious-gaming.html
 * Selectors from captured DOM: div.twoColumn.section with .two-column class
 *
 * Target structure (from block library):
 * | columns |
 * | col1-content | col2-content |
 * Each two-column split becomes one row with text in one col and image in the other.
 */
export default function parse(element, { document }) {
  const cells = [];

  const col1 = element.querySelector('.col1 .twocolumnpar-one');
  const col2 = element.querySelector('.col2 .twocolumnpar-two');

  if (col1 && col2) {
    const col1Content = [];
    const col2Content = [];

    // Extract content from col1
    const col1Img = col1.querySelector('.atom-image img, img');
    const col1Heading = col1.querySelector('h2, h3');
    const col1Texts = col1.querySelectorAll('.a-text p');
    const col1Cta = col1.querySelector('.a-text a');

    if (col1Img) col1Content.push(col1Img);
    if (col1Heading) col1Content.push(col1Heading);
    col1Texts.forEach((p) => { if (p.textContent.trim()) col1Content.push(p); });
    if (col1Cta && !col1Content.includes(col1Cta)) col1Content.push(col1Cta);

    // Extract content from col2
    const col2Img = col2.querySelector('.atom-image img, img');
    const col2Heading = col2.querySelector('h2, h3');
    const col2Texts = col2.querySelectorAll('.a-text p');
    const col2Cta = col2.querySelector('.a-text a');

    if (col2Img) col2Content.push(col2Img);
    if (col2Heading) col2Content.push(col2Heading);
    col2Texts.forEach((p) => { if (p.textContent.trim()) col2Content.push(p); });
    if (col2Cta && !col2Content.includes(col2Cta)) col2Content.push(col2Cta);

    if (col1Content.length > 0 || col2Content.length > 0) {
      cells.push([col1Content, col2Content]);
    }
  }

  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
    element.replaceWith(block);
  }
}
