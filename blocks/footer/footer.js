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

    // Last section is copyright/disclaimer
    const copyright = sections.pop();
    if (copyright) copyright.classList.add('section-copyright');

    // Second-to-last section is legal links
    const legal = sections.pop();
    if (legal) legal.classList.add('section-legal');

    // First section contains logo, company links, and social links
    if (sections[0]) sections[0].classList.add('section-links');

    // Extract logo from section-links into its own container for flex layout
    const logoP = fragment.querySelector('.section-links .default-content p:first-child');
    let logoContainer = null;
    if (logoP) {
      const logoPicture = logoP.querySelector('picture');
      const logoImg = logoPicture?.querySelector('img') || logoP.querySelector('img');
      if (logoImg) {
        const directImg = document.createElement('img');
        const origSrc = logoImg.getAttribute('src') || '';
        directImg.src = origSrc.includes('.svg') ? origSrc : '/img/intel-logo.svg';
        directImg.alt = logoImg.alt || 'Intel';
        directImg.loading = 'lazy';
        directImg.className = 'footer-logo';

        const logoLink = logoP.querySelector('a');
        logoContainer = document.createElement('div');
        logoContainer.className = 'footer-logo-container';
        if (logoLink) {
          const a = document.createElement('a');
          a.href = logoLink.href;
          a.append(directImg);
          logoContainer.append(a);
        } else {
          logoContainer.append(directImg);
        }
        logoP.remove();
      }
    }

    // Wrap all sections in a content div
    const contentDiv = document.createElement('div');
    contentDiv.className = 'footer-main-content';
    [...fragment.querySelectorAll('.section')].forEach((s) => contentDiv.append(s));

    // Build flex layout: logo left, content right
    fragment.textContent = '';
    if (logoContainer) fragment.append(logoContainer);
    fragment.append(contentDiv);

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
