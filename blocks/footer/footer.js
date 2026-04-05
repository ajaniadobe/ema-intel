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

    // Replace optimized <picture> logo with direct <img> for reliable SVG rendering
    const logoPicture = fragment.querySelector('.section:first-child picture');
    if (logoPicture) {
      const img = logoPicture.querySelector('img');
      if (img) {
        const directImg = document.createElement('img');
        // Use authored src from the original img, falling back to local logo
        const origSrc = img.getAttribute('src') || '';
        directImg.src = origSrc.includes('.svg') ? origSrc : '/img/intel-logo.svg';
        directImg.alt = img.alt || 'Intel';
        directImg.loading = 'lazy';
        logoPicture.replaceWith(directImg);
      }
    }

    el.append(fragment);

    // Fix YouTube auto-embed: restore video wrapper back to a plain link
    // Preserves the authored URL and text from the original content
    el.querySelectorAll('.video').forEach((wrapper) => {
      const li = wrapper.closest('li');
      if (!li) return;
      const iframe = wrapper.querySelector('iframe');
      const dataSrc = wrapper.dataset.src || iframe?.src || '';
      // Extract YouTube channel/video URL from embed
      const ytMatch = dataSrc.match(/youtube[^/]*\/embed\/([^?]+)/);
      const originalText = li.textContent.trim() || 'YouTube';
      const href = ytMatch
        ? `https://www.youtube.com/user/${ytMatch[1]}`
        : dataSrc.replace('/embed/', '/watch?v=') || '#';
      const a = document.createElement('a');
      a.href = href;
      a.textContent = originalText;
      li.textContent = '';
      li.append(a);
    });
  } catch (e) {
    throw Error(e);
  }
}
