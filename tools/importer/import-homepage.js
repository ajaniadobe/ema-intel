/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsQuicklinksParser from './parsers/cards-quicklinks.js';

// TRANSFORMER IMPORTS
import intelCleanupTransformer from './transformers/intel-cleanup.js';
import intelSectionsTransformer from './transformers/intel-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-news': cardsNewsParser,
  'cards-quicklinks': cardsQuicklinksParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Homepage with dark immersive hero carousel, minimal content sections, brand statement with quick-link cards, and unique compact navigation variant',
  urls: [
    'https://www.intel.com/content/www/us/en/homepage.html',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['div.animatedhero.carousel'],
    },
    {
      name: 'cards-news',
      instances: ['div.newsarticle'],
    },
    {
      name: 'cards-quicklinks',
      instances: ['div.cmp-tiles-info__items'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Carousel',
      selector: 'div.dark-theme',
      style: 'dark',
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'News Section',
      selector: 'div.ui-container--with-spacing',
      style: null,
      blocks: ['cards-news'],
      defaultContent: ['div.title.cmp-title--news', 'div.separator'],
    },
    {
      id: 'section-3',
      name: 'Brand Statement and Quick Links',
      selector: 'div.tiles',
      style: null,
      blocks: ['cards-quicklinks'],
      defaultContent: ['div.tiles div.cmp-title'],
    },
  ],
};

// TRANSFORMER REGISTRY
// Section transformer included because template has 3 sections
const transformers = [
  intelCleanupTransformer,
  intelSectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (strip /content/www/us/en prefix and .html)
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
