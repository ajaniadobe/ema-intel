/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.intel.com/content/www/us/en/homepage.html
 * Selectors from captured DOM: div.animatedhero.carousel
 *
 * Target structure (from block library):
 * | carousel-hero |
 * | image | heading + description + CTA |
 * | image | heading + description + CTA |
 * ...
 */
export default function parse(element, { document }) {
  // Each slide is a cube face with image + info panel
  const cubeFaces = element.querySelectorAll('.cmp-animated-hero__cube-face');
  const cells = [];

  cubeFaces.forEach((face) => {
    // Col 1: Product badge image
    const img = face.querySelector('.cmp-image__image, .cmp-teaser__image img');

    // Col 2: Text content (eyebrow + heading + description + CTA)
    const infoPanel = face.querySelector('.cmp-animated-hero__info-panel-container');
    const contentCell = [];

    if (infoPanel) {
      const eyebrow = infoPanel.querySelector('.cmp-animated-hero__info-panel-eyebrow');
      const heading = infoPanel.querySelector('.cmp-animated-hero__info-panel-headline');
      const description = infoPanel.querySelector('.cmp-animated-hero__info-panel-description');
      const cta = infoPanel.querySelector('.cmp-animated-hero__info-panel-cta');

      if (eyebrow) contentCell.push(eyebrow);
      if (heading) contentCell.push(heading);
      if (description) contentCell.push(description);
      if (cta) contentCell.push(cta);
    }

    if (img || contentCell.length > 0) {
      cells.push([img || '', contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
