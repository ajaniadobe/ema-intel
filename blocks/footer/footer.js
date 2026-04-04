import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const { locale } = getConfig();
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    fragment.classList.add('footer-content');

    const sections = [...fragment.querySelectorAll('.section')];

    const copyright = sections.pop();
    copyright.classList.add('section-copyright');

    const legal = sections.pop();
    legal.classList.add('section-legal');

    // Replace optimized <picture> logo with direct <img> for SVG
    const logoPicture = fragment.querySelector('.section:first-child picture');
    if (logoPicture) {
      const img = logoPicture.querySelector('img');
      if (img) {
        const directImg = document.createElement('img');
        directImg.src = '/img/intel-logo.svg';
        directImg.alt = img.alt || 'Intel';
        directImg.loading = 'lazy';
        logoPicture.replaceWith(directImg);
      }
    }

    el.append(fragment);

    // Fix YouTube auto-embed: restore video wrapper back to a plain link
    // Must run after append so the DOM is fully decorated
    el.querySelectorAll('.video').forEach((wrapper) => {
      const li = wrapper.closest('li');
      if (li) {
        li.innerHTML = '<a href="https://www.youtube.com/user/channelintel">YouTube</a>';
      }
    });
  } catch (e) {
    throw Error(e);
  }
}
