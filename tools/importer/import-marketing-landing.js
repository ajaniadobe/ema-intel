/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsProductParser from './parsers/cards-product.js';
import columnsParser from './parsers/columns.js';
import retailerLocatorParser from './parsers/retailer-locator.js';
import cardsResourceParser from './parsers/cards-resource.js';

// TRANSFORMER IMPORTS
import intelCleanupTransformer from './transformers/intel-cleanup.js';
import intelSectionsTransformer from './transformers/intel-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards-product': cardsProductParser,
  'columns': columnsParser,
  'retailer-locator': retailerLocatorParser,
  'cards-resource': cardsResourceParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'marketing-landing',
  description: 'Long-form marketing landing page with sticky in-page anchor navigation, alternating text/image content sections, expandable card grids, resource link cards, and CTAs',
  urls: [
    'https://www.intel.com/content/www/us/en/gaming/serious-gaming.html',
    'https://www.intel.com/content/www/us/en/artificial-intelligence/overview.html',
  ],
  blocks: [
    { name: 'hero', instances: ['section.ihp-hero-full-bleed'] },
    { name: 'cards-product', instances: ['div.twoColumn.section:has(.fifty-fifty)', 'div.promotions.section'] },
    { name: 'columns', instances: ['div.twoColumn.section:has(.two-column)'] },
    { name: 'retailer-locator', instances: ['div.linklist.section'] },
    { name: 'cards-resource', instances: ['div.simpleCard.section'] },
  ],
  sections: [
    { id: 'section-1', name: 'Hero', selector: 'section.ihp-hero-full-bleed', style: 'dark', blocks: ['hero'], defaultContent: [] },
    { id: 'section-2', name: 'Overview Content', selector: 'div#introtext_copy', style: 'dark', blocks: ['cards-product'], defaultContent: ['div#introtext_copy .intro-text-component', 'div#introtext .intro-text-component'] },
    { id: 'section-3', name: 'Platform Advantages', selector: 'div.introtext.section:nth-of-type(3)', style: 'dark', blocks: ['columns'], defaultContent: [] },
    { id: 'section-4', name: 'Shop and Resources', selector: 'div.linklist.section', style: 'dark', blocks: ['retailer-locator', 'cards-resource'], defaultContent: ['div.oneColumn.section', 'div.reference.section'] },
    { id: 'section-5', name: 'Footnotes', selector: 'div.disclaimer', style: null, blocks: [], defaultContent: ['div.disclaimer'] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  intelCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [intelSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const originalPath = new URL(params.originalURL).pathname
      .replace(/\/content\/www\/us\/en\//, '/')
      .replace(/\/$/, '')
      .replace(/\.html$/, '');
    const path = WebImporter.FileUtils.sanitizePath(originalPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
