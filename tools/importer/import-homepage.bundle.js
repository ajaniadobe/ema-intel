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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const cubeFaces = element.querySelectorAll(".cmp-animated-hero__cube-face");
    const cells = [];
    cubeFaces.forEach((face) => {
      const img = face.querySelector(".cmp-image__image, .cmp-teaser__image img");
      const infoPanel = face.querySelector(".cmp-animated-hero__info-panel-container");
      const contentCell = [];
      if (infoPanel) {
        const eyebrow = infoPanel.querySelector(".cmp-animated-hero__info-panel-eyebrow");
        const heading = infoPanel.querySelector(".cmp-animated-hero__info-panel-headline");
        const description = infoPanel.querySelector(".cmp-animated-hero__info-panel-description");
        const cta = infoPanel.querySelector(".cmp-animated-hero__info-panel-cta");
        if (eyebrow) contentCell.push(eyebrow);
        if (heading) contentCell.push(heading);
        if (description) contentCell.push(description);
        if (cta) contentCell.push(cta);
      }
      if (img || contentCell.length > 0) {
        cells.push([img || "", contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
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

  // tools/importer/parsers/cards-quicklinks.js
  function parse3(element, { document }) {
    const tiles = element.querySelectorAll(".cmp-tiles-info__item");
    const cells = [];
    tiles.forEach((tile) => {
      const button = tile.querySelector("a.cmp-button");
      if (!button) return;
      const iconSpan = button.querySelector(".cmp-button__icon");
      let iconCell = "";
      if (iconSpan) {
        const iconClass = [...iconSpan.classList].find((c) => c.startsWith("cmp-button__icon--"));
        const iconName = iconClass ? iconClass.replace("cmp-button__icon--", "") : "icon";
        const img = document.createElement("img");
        img.src = `/icons/${iconName}.svg`;
        img.alt = iconName;
        iconCell = img;
      }
      const labelSpan = button.querySelector(".cmp-button__text");
      const link = document.createElement("a");
      link.href = button.href;
      link.textContent = labelSpan ? labelSpan.textContent.trim() : button.textContent.trim();
      cells.push([iconCell, [link]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-quicklinks", cells });
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
      const mainEl = element.querySelector("main#primary-content, main");
      if (mainEl) {
        const children = [...element.children];
        children.forEach((child) => {
          if (child !== mainEl) {
            child.remove();
          }
        });
        while (mainEl.firstChild) {
          element.appendChild(mainEl.firstChild);
        }
        mainEl.remove();
      }
      WebImporter.DOMUtils.remove(element, [
        "footer.global",
        'footer[id="skip-footer"]',
        ".get-help-blade",
        "div.get-help"
      ]);
      element.querySelectorAll('link[rel="stylesheet"]').forEach((link) => link.remove());
      element.querySelectorAll(".navbar-toggler-title").forEach((span) => {
        if (span.textContent.trim() === "Get Help") {
          const btn = span.closest("button") || span.closest(".get-help");
          if (btn) btn.remove();
          else span.remove();
        }
      });
      element.querySelectorAll('[class*="get-help"]').forEach((el) => el.remove());
      element.querySelectorAll('link[href*="clientlibs"], script[src*="clientlibs"]').forEach((el) => el.remove());
      element.querySelectorAll("script").forEach((s) => {
        if (!s.src) s.remove();
      });
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
      element.querySelectorAll('a[href="#primary-content"]').forEach((a) => {
        const p = a.closest("p");
        if (p) p.remove();
      });
      element.querySelectorAll('img[alt*="Intel logo - Return"]').forEach((img) => {
        var _a;
        const p = img.closest("p") || ((_a = img.closest("a")) == null ? void 0 : _a.closest("p"));
        if (p) p.remove();
      });
      element.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim() === "Toggle Navigation") p.remove();
      });
      element.querySelectorAll("ol").forEach((ol) => {
        var _a;
        const items = ol.querySelectorAll(":scope > li");
        if (items.length > 0) {
          const firstText = ((_a = items[0].textContent) == null ? void 0 : _a.trim()) || "";
          if (firstText.startsWith("Products")) {
            ol.remove();
          }
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        const text = p.textContent.trim();
        if (/^Sign In My Intel$|^My Tools$|^Sign Out$|^English$|^Toggle Search$|^close$|^Search$|^Feedback$|^ChatBot Btn$|^Expand$|^Collapse$/.test(text) || text.startsWith("Search ") && text.includes("Search Intel.com") || text === "?") {
          p.remove();
        }
      });
      element.querySelectorAll("li").forEach((li) => {
        if (li.textContent.trim() === "?" && li.children.length === 0) li.remove();
      });
      element.querySelectorAll("h2").forEach((h2) => {
        if (h2.textContent.trim() === "Select Your Language") {
          let sibling = h2.nextElementSibling;
          let removed = 0;
          while (sibling && removed < 2) {
            const next = sibling.nextElementSibling;
            if (sibling.tagName === "UL") {
              sibling.remove();
              removed++;
            } else {
              break;
            }
            sibling = next;
          }
          h2.remove();
        }
      });
      ["Using Intel.com Search", "Quick Links", "Recent Searches", "Advanced Search", "Only search in"].forEach((text) => {
        element.querySelectorAll("h3").forEach((h3) => {
          if (h3.textContent.trim() === text) {
            let sibling = h3.nextElementSibling;
            while (sibling && !["H1", "H2", "H3", "DIV"].includes(sibling.tagName)) {
              const next = sibling.nextElementSibling;
              sibling.remove();
              sibling = next;
            }
            h3.remove();
          }
        });
      });
      element.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim().match(/^Sign [Ii]n\s+to access restricted content\.?$/)) {
          p.remove();
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        if (p.textContent.includes("browser version you are using is not recommended")) {
          const next = p.nextElementSibling;
          if (next && next.tagName === "UL") {
            const browsers = next.querySelectorAll("a");
            const isBrowserList = [...browsers].some((a) => /Safari|Chrome|Edge|Firefox/.test(a.textContent));
            if (isBrowserList) next.remove();
          }
          p.remove();
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        const text = p.textContent.trim();
        if (text === "Get Help") p.remove();
        if (text.startsWith('<link rel="stylesheet"') || text.startsWith("<script")) p.remove();
      });
      element.querySelectorAll("ul").forEach((ul) => {
        const links = ul.querySelectorAll("a");
        if (links.length >= 5) {
          const hrefs = [...links].map((a) => a.getAttribute("href") || "");
          if (hrefs.some((h) => h.includes("company-overview")) && hrefs.some((h) => h.includes("newsroom"))) {
            ul.remove();
          }
        }
      });
      element.querySelectorAll("ul").forEach((ul) => {
        const links = ul.querySelectorAll("a");
        if (links.length >= 3) {
          const hrefs = [...links].map((a) => a.getAttribute("href") || "");
          if (hrefs.some((h) => h.includes("facebook.com/Intel")) && hrefs.some((h) => h.includes("twitter.com/intel"))) {
            ul.remove();
          }
        }
      });
      element.querySelectorAll("ul").forEach((ul) => {
        const links = ul.querySelectorAll("a");
        if (links.length >= 4) {
          const hrefs = [...links].map((a) => a.getAttribute("href") || "");
          if (hrefs.some((h) => h.includes("terms-of-use")) && hrefs.some((h) => h.includes("trademarks"))) {
            ul.remove();
          }
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        if (p.textContent.includes("Intel technologies may require enabled hardware")) {
          p.remove();
        }
      });
      element.querySelectorAll('img[alt="Intel Footer Logo"]').forEach((img) => {
        var _a;
        const p = img.closest("p") || ((_a = img.closest("a")) == null ? void 0 : _a.closest("p"));
        if (p) p.remove();
      });
      element.querySelectorAll('a[href="javascript:void();"]').forEach((a) => {
        const p = a.closest("p");
        if (p) p.remove();
      });
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

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse,
    "cards-news": parse2,
    "cards-quicklinks": parse3
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Homepage with dark immersive hero carousel, minimal content sections, brand statement with quick-link cards, and unique compact navigation variant",
    urls: [
      "https://www.intel.com/content/www/us/en/homepage.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: ["div.animatedhero.carousel"]
      },
      {
        name: "cards-news",
        instances: ["div.newsarticle"]
      },
      {
        name: "cards-quicklinks",
        instances: ["div.cmp-tiles-info__items"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Carousel",
        selector: "div.dark-theme",
        style: "dark",
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "News Section",
        selector: "div.ui-container--with-spacing",
        style: null,
        blocks: ["cards-news"],
        defaultContent: ["div.title.cmp-title--news", "div.separator"]
      },
      {
        id: "section-3",
        name: "Brand Statement and Quick Links",
        selector: "div.tiles",
        style: null,
        blocks: ["cards-quicklinks"],
        defaultContent: ["div.tiles div.cmp-title"]
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
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
        } else {
          console.warn(`No parser found for block: ${block.name}`);
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
  return __toCommonJS(import_homepage_exports);
})();
