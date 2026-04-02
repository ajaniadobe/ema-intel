var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-institutional-landing.js
  var import_institutional_landing_exports = {};
  __export(import_institutional_landing_exports, {
    default: () => import_institutional_landing_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const cells = [];
    const bgImg = element.querySelector(".ihp-hero-full-bleed__media img");
    if (bgImg) {
      cells.push([bgImg]);
    }
    const contentCell = [];
    const heading = element.querySelector(".ihp-hero-full-bleed__header, h1");
    const description = element.querySelector(".ihp-hero-full-bleed__copy, .ihp-hero-full-bleed__content p");
    const cta = element.querySelector(".ihp-hero-full-bleed__content a.btn, .ihp-hero-full-bleed__content a.cta");
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    if (cta) contentCell.push(cta);
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function parse2(element, { document }) {
    const articles = element.querySelectorAll(".article-item");
    const cells = [];
    articles.forEach((article) => {
      const contentCell = [];
      const pretitle = article.querySelector(".cmp-teaser__pretitle");
      const heading = article.querySelector(".cmp-teaser__title");
      const description = article.querySelector(".cmp-teaser__description p, .cmp-teaser__description");
      const ctaText = article.querySelector(".cmp-teaser__action-container");
      const link = article.querySelector("a.article-item__link");
      if (pretitle) contentCell.push(pretitle);
      if (heading) contentCell.push(heading);
      if (description) contentCell.push(description);
      if (ctaText && link) {
        const cta = document.createElement("a");
        cta.href = link.href;
        cta.textContent = ctaText.textContent.trim();
        contentCell.push(cta);
      }
      if (contentCell.length > 0) {
        cells.push([contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/intel-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[class*="onetrust"]',
        '[id*="CookiebotDialog"]'
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header.ighf-h",
        "footer.ighf-h__footer",
        "div.skip-to-main",
        ".cmp-experiencefragment--header",
        ".cmp-experiencefragment--footer",
        "noscript",
        "iframe",
        "link"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-cmp-link-accessibility-enabled");
        el.removeAttribute("data-cmp-link-accessibility-text");
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
      });
      element.querySelectorAll('a[href*="/content/www/"]').forEach((a) => {
        const href = a.getAttribute("href");
        if (href) {
          a.setAttribute("href", href.replace(/\/content\/www\/us\/en\//g, "/"));
        }
      });
    }
  }

  // tools/importer/transformers/intel-sections.js
  var H2 = { after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const sections = [...template.sections].reverse();
      sections.forEach((section) => {
        const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectorList) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) return;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (section.id !== template.sections[0].id) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-institutional-landing.js
  var parsers = {
    "hero": parse,
    "cards-news": parse2
  };
  var PAGE_TEMPLATE = {
    name: "institutional-landing",
    description: "Institutional landing page with hero, text-heavy sections, and card groups",
    urls: [
      "https://www.intel.com/content/www/us/en/support.html",
      "https://www.intel.com/content/www/us/en/corporate-responsibility/corporate-responsibility.html"
    ],
    blocks: [
      { name: "hero", instances: ["div.marquee-search", "section.ihp-hero-full-bleed"] },
      { name: "cards-news", instances: ["div.promotions.section"] }
    ],
    sections: [
      { id: "section-1", name: "Hero", selector: ["div.marquee-search", "section.ihp-hero-full-bleed"], style: "dark", blocks: ["hero"], defaultContent: [] },
      { id: "section-2", name: "Main Content", selector: "div.bladepar", style: null, blocks: ["cards-news"], defaultContent: [] },
      { id: "section-3", name: "Contact CTA", selector: "div.oneColumn.section", style: "dark", blocks: [], defaultContent: ["div.one-column"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_institutional_landing_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const originalPath = new URL(params.originalURL).pathname.replace(/\/content\/www\/us\/en\//, "/").replace(/\/$/, "").replace(/\.html$/, "");
      const path = WebImporter.FileUtils.sanitizePath(originalPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_institutional_landing_exports);
})();
