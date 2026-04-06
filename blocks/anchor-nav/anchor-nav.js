export default function init(el) {
  const ul = el.querySelector('ul');
  if (!ul) return;

  const nav = document.createElement('nav');
  nav.className = 'anchor-nav-bar';
  nav.setAttribute('aria-label', 'Page sections');

  const links = ul.querySelectorAll('a');
  links.forEach((a) => {
    const btn = document.createElement('a');
    btn.href = a.href;
    btn.textContent = a.textContent;
    btn.className = 'anchor-nav-link';
    nav.append(btn);
  });

  el.textContent = '';
  el.append(nav);

  // Move anchor-nav out of its section so sticky works across the whole page.
  // In EDS each section is a direct child of <main>; sticky only works within
  // the containing block, so we need anchor-nav to be a direct child of <main>.
  const section = el.closest('.section');
  const main = document.querySelector('main');
  if (section && main) {
    const wrapper = document.createElement('div');
    wrapper.className = 'section anchor-nav-section';
    wrapper.append(el);
    section.after(wrapper);
  }

  // Smooth scroll behavior
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('.anchor-nav-link');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (!hash.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(hash);
    if (target) {
      const headerH = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--header-height'),
        10,
      ) || 64;
      const navH = el.offsetHeight;
      const top = target.offsetTop - headerH - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
}
