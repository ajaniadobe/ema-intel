import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const { locale } = getConfig();

const HEADER_PATH = '/fragments/nav/header';
const HEADER_ACTIONS = [
  '/tools/widgets/scheme',
  '/tools/widgets/language',
  '/tools/widgets/toggle',
];

const SIGN_IN_URL = 'https://www.intel.com/content/www/us/en/secure/my-intel.html';

function closeAllMenus() {
  const openMenus = document.body.querySelectorAll('header .is-open');
  for (const openMenu of openMenus) {
    openMenu.classList.remove('is-open');
  }
}

function docClose(e) {
  if (e.target.closest('header')) return;
  closeAllMenus();
}

function toggleMenu(menu) {
  const isOpen = menu.classList.contains('is-open');
  closeAllMenus();
  if (isOpen) {
    document.removeEventListener('click', docClose);
    return;
  }

  // Setup the global close event
  document.addEventListener('click', docClose);
  menu.classList.add('is-open');
}

function decorateLanguage(btn) {
  const section = btn.closest('.section');
  btn.addEventListener('click', async () => {
    let menu = section.querySelector('.language.menu');
    if (!menu) {
      const content = document.createElement('div');
      content.classList.add('block-content');
      const fragment = await loadFragment(`${locale.prefix}${HEADER_PATH}/languages`);
      menu = document.createElement('div');
      menu.className = 'language menu';
      menu.append(fragment);
      content.append(menu);
      section.append(content);
    }
    toggleMenu(section);
  });
}

function decorateScheme(btn) {
  // Sign In: redirect to sign-in page
  btn.addEventListener('click', () => {
    window.location.href = SIGN_IN_URL;
  });
}

function decorateSearch(btn) {
  const section = btn.closest('.section');
  btn.addEventListener('click', () => {
    toggleMenu(section);
  });
}

async function decorateAction(header, pattern) {
  const link = header.querySelector(`[href*="${pattern}"]`);
  if (!link) return;

  const icon = link.querySelector('.icon');
  const text = link.textContent;
  const iconName = icon?.classList?.[1]?.replace('icon-', '') || '';
  const btn = document.createElement('button');

  // Use inline <img> for reliable SVG icon rendering
  if (iconName) {
    const img = document.createElement('img');
    img.src = `/icons/${iconName}.svg`;
    img.alt = '';
    img.className = 'action-icon';
    img.width = 20;
    img.height = 20;
    btn.append(img);
  }

  if (text) {
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = text;
    btn.append(textSpan);
  }
  const wrapper = document.createElement('div');
  wrapper.className = `action-wrapper ${iconName}`;
  wrapper.append(btn);
  link.parentElement.parentElement.replaceChild(wrapper, link.parentElement);

  if (pattern === '/tools/widgets/language') decorateLanguage(btn);
  if (pattern === '/tools/widgets/scheme') decorateScheme(btn);
  if (pattern === '/tools/widgets/toggle') decorateSearch(btn);
}

function decorateMenu(li) {
  // Support nested <ul> as a dropdown menu (DA strips .fragment-content wrappers)
  const nestedUl = li.querySelector(':scope > ul');
  if (!nestedUl) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu';
  const content = document.createElement('div');
  content.className = 'fragment-content';
  content.append(nestedUl);
  wrapper.append(content);
  li.append(wrapper);
  return wrapper;
}

function decorateMegaMenu(li) {
  const menu = li.querySelector('.fragment-content');
  if (!menu) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu';
  wrapper.append(menu);
  li.append(wrapper);
  return wrapper;
}

function decorateNavItem(li) {
  li.classList.add('main-nav-item');
  const link = li.querySelector(':scope > p > a');
  if (link) link.classList.add('main-nav-link');
  const menu = decorateMegaMenu(li) || decorateMenu(li);
  if (!(menu || link)) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu(li);
  });
}

function decorateBrandSection(section) {
  section.classList.add('brand-section');
  const brandLink = section.querySelector('a');
  if (!brandLink) return;

  // Replace optimized <picture> logo with direct <img> for reliable SVG rendering
  const logoPicture = brandLink.querySelector('picture');
  if (logoPicture) {
    const img = document.createElement('img');
    img.src = '/img/intel-logo.svg';
    img.alt = 'Intel';
    img.loading = 'eager';
    logoPicture.replaceWith(img);
  }

  // Find text nodes (not images/pictures) and wrap in brand-text span
  const textNodes = [...brandLink.childNodes].filter(
    (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
  );
  const existingSpans = [...brandLink.querySelectorAll(':scope > span')].filter(
    (s) => !s.querySelector('picture') && !s.querySelector('img'),
  );

  const span = document.createElement('span');
  span.className = 'brand-text';
  if (textNodes.length) {
    textNodes.forEach((t) => span.append(t));
  } else if (existingSpans.length) {
    existingSpans.forEach((s) => span.append(s));
  }
  if (span.textContent.trim()) {
    brandLink.append(span);
  }
}

function decorateNavSection(section) {
  section.classList.add('main-nav-section');
  const navContent = section.querySelector('.default-content');
  const navList = section.querySelector('ul');
  if (!navList) return;
  navList.classList.add('main-nav-list');

  const nav = document.createElement('nav');
  nav.append(navList);
  navContent.append(nav);

  const mainNavItems = section.querySelectorAll('nav > ul > li');
  for (const navItem of mainNavItems) {
    decorateNavItem(navItem);
  }
}

async function decorateActionSection(section) {
  section.classList.add('actions-section');
}

async function decorateHeader(fragment) {
  const sections = fragment.querySelectorAll(':scope > .section');
  if (sections[0]) decorateBrandSection(sections[0]);
  if (sections[1]) decorateNavSection(sections[1]);
  if (sections[2]) decorateActionSection(sections[2]);

  for (const pattern of HEADER_ACTIONS) {
    decorateAction(fragment, pattern);
  }
}

/**
 * loads and decorates the header
 * @param {Element} el The header element
 */
export default async function init(el) {
  const headerMeta = getMetadata('header');
  const path = headerMeta || HEADER_PATH;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    fragment.classList.add('header-content');
    await decorateHeader(fragment);
    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
