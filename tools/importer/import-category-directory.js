/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';

// TRANSFORMER IMPORTS
import intelCleanupTransformer from './transformers/intel-cleanup.js';
import intelSectionsTransformer from './transformers/intel-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'category-directory',
  description: 'Category directory page with hero, category link grids, and CTA banner',
  urls: [
    'https://www.intel.com/content/www/us/en/products/overview.html',
    'https://www.intel.com/content/www/us/en/developer/overview.html',
  ],
  blocks: [
    { name: 'hero', instances: ['div.marquee-search'] },
  ],
  sections: [
    { id: 'section-1', name: 'Hero Search', selector: 'div.marquee-search', style: 'dark', blocks: ['hero'], defaultContent: [] },
    { id: 'section-2', name: 'Product Categories', selector: 'div.linklist.section', style: null, blocks: [], defaultContent: ['div.blade-list'] },
    { id: 'section-3', name: 'CTA Banner', selector: 'div.oneColumn.section', style: 'dark', blocks: [], defaultContent: ['div.one-column'] },
  ],
};

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
