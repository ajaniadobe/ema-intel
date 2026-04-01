/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-news. Base: cards (no images).
 * Source: https://www.intel.com/content/www/us/en/homepage.html
 * Selectors from captured DOM: div.newsarticle
 *
 * Target structure (from block library, no-images variant):
 * | cards-news |
 * | pretitle + heading + description + CTA |
 * | pretitle + heading + description + CTA |
 * ...
 * Single column per row (no images).
 */
export default function parse(element, { document }) {
  const articles = element.querySelectorAll('.article-item');
  const cells = [];

  articles.forEach((article) => {
    const contentCell = [];

    const pretitle = article.querySelector('.cmp-teaser__pretitle');
    const heading = article.querySelector('.cmp-teaser__title');
    const description = article.querySelector('.cmp-teaser__description p, .cmp-teaser__description');
    const ctaText = article.querySelector('.cmp-teaser__action-container');
    const link = article.querySelector('a.article-item__link');

    if (pretitle) contentCell.push(pretitle);
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);

    // Create a proper CTA link from the action text and card link
    if (ctaText && link) {
      const cta = document.createElement('a');
      cta.href = link.href;
      cta.textContent = ctaText.textContent.trim();
      contentCell.push(cta);
    }

    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
