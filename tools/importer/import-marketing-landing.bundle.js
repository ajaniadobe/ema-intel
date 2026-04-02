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

  // tools/importer/import-marketing-landing.js
  var import_marketing_landing_exports = {};
  __export(import_marketing_landing_exports, {
    default: () => import_marketing_landing_default
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

  // tools/importer/parsers/cards-product.js
  function parse2(element, { document }) {
    const cells = [];
    const twoColItems = element.querySelectorAll(".twocolumnpar-one, .twocolumnpar-two");
    if (twoColItems.length > 0) {
      twoColItems.forEach((item) => {
        const img = item.querySelector(".atom-image img, img");
        const heading = item.querySelector("h3 a, h3");
        const desc = item.querySelector(".a-text p");
        const cta = item.querySelector(".a-text a");
        const contentCell = [];
        if (heading) contentCell.push(heading);
        if (desc && desc !== (cta == null ? void 0 : cta.closest("p"))) contentCell.push(desc);
        if (cta) contentCell.push(cta);
        cells.push([img || "", contentCell]);
      });
    }
    const promoItems = element.querySelectorAll(".blade-item.promotions-item");
    if (promoItems.length > 0) {
      promoItems.forEach((item) => {
        const img = item.querySelector(".blade-image img, figure img");
        const heading = item.querySelector(".blade-item-heading a, .blade-item-heading");
        const desc = item.querySelector(".blade-item-content p");
        const contentCell = [];
        if (heading) contentCell.push(heading);
        if (desc) contentCell.push(desc);
        cells.push([img || "", contentCell]);
      });
    }
    if (cells.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const cells = [];
    const col1 = element.querySelector(".col1 .twocolumnpar-one");
    const col2 = element.querySelector(".col2 .twocolumnpar-two");
    if (col1 && col2) {
      const col1Content = [];
      const col2Content = [];
      const col1Img = col1.querySelector(".atom-image img, img");
      const col1Heading = col1.querySelector("h2, h3");
      const col1Texts = col1.querySelectorAll(".a-text p");
      const col1Cta = col1.querySelector(".a-text a");
      if (col1Img) col1Content.push(col1Img);
      if (col1Heading) col1Content.push(col1Heading);
      col1Texts.forEach((p) => {
        if (p.textContent.trim()) col1Content.push(p);
      });
      if (col1Cta && !col1Content.includes(col1Cta)) col1Content.push(col1Cta);
      const col2Img = col2.querySelector(".atom-image img, img");
      const col2Heading = col2.querySelector("h2, h3");
      const col2Texts = col2.querySelectorAll(".a-text p");
      const col2Cta = col2.querySelector(".a-text a");
      if (col2Img) col2Content.push(col2Img);
      if (col2Heading) col2Content.push(col2Heading);
      col2Texts.forEach((p) => {
        if (p.textContent.trim()) col2Content.push(p);
      });
      if (col2Cta && !col2Content.includes(col2Cta)) col2Content.push(col2Cta);
      if (col1Content.length > 0 || col2Content.length > 0) {
        cells.push([col1Content, col2Content]);
      }
    }
    if (cells.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/retailer-locator.js
  function parse4(element, { document }) {
    const heading = element.querySelector("h2");
    const headingText = heading ? heading.textContent.trim() : "Where to Buy";
    const h = document.createElement("h2");
    h.textContent = headingText;
    const p = document.createElement("p");
    p.textContent = "Retailer locator coming soon. Visit intel.com/buy for current options.";
    const cells = [[h, p]];
    const block = WebImporter.Blocks.createBlock(document, { name: "retailer-locator", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-resource.js
  function parse5(element, { document }) {
    const cards = element.querySelectorAll(".simple-card-item");
    const cells = [];
    cards.forEach((card) => {
      const link = card.querySelector("a.content, .body a");
      if (link) {
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.textContent.trim();
        cells.push([[a]]);
      }
    });
    if (cells.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, { name: "cards-resource", cells });
      element.replaceWith(block);
    }
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

  // tools/importer/import-marketing-landing.js
  var parsers = {
    "hero": parse,
    "cards-product": parse2,
    "columns": parse3,
    "retailer-locator": parse4,
    "cards-resource": parse5
  };
  var PAGE_TEMPLATE = {
    name: "marketing-landing",
    description: "Long-form marketing landing page with sticky in-page anchor navigation, alternating text/image content sections, expandable card grids, resource link cards, and CTAs",
    urls: [
      "https://www.intel.com/content/www/us/en/gaming/serious-gaming.html",
      "https://www.intel.com/content/www/us/en/artificial-intelligence/overview.html"
    ],
    blocks: [
      { name: "hero", instances: ["section.ihp-hero-full-bleed"] },
      { name: "cards-product", instances: ["div.twoColumn.section:has(.fifty-fifty)", "div.promotions.section"] },
      { name: "columns", instances: ["div.twoColumn.section:has(.two-column)"] },
      { name: "retailer-locator", instances: ["div.linklist.section"] },
      { name: "cards-resource", instances: ["div.simpleCard.section"] }
    ],
    sections: [
      { id: "section-1", name: "Hero", selector: "section.ihp-hero-full-bleed", style: "dark", blocks: ["hero"], defaultContent: [] },
      { id: "section-2", name: "Overview Content", selector: "div#introtext_copy", style: "dark", blocks: ["cards-product"], defaultContent: ["div#introtext_copy .intro-text-component", "div#introtext .intro-text-component"] },
      { id: "section-3", name: "Platform Advantages", selector: "div.introtext.section:nth-of-type(3)", style: "dark", blocks: ["columns"], defaultContent: [] },
      { id: "section-4", name: "Shop and Resources", selector: "div.linklist.section", style: "dark", blocks: ["retailer-locator", "cards-resource"], defaultContent: ["div.oneColumn.section", "div.reference.section"] },
      { id: "section-5", name: "Footnotes", selector: "div.disclaimer", style: null, blocks: [], defaultContent: ["div.disclaimer"] }
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
  var import_marketing_landing_default = {
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
  return __toCommonJS(import_marketing_landing_exports);
})();
