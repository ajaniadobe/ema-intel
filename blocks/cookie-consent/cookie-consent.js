export default function init(el) {
  el.style.backgroundColor = '#000';
  el.style.color = '#fff';
  el.style.padding = '48px 24px';
  el.style.textAlign = 'center';
  const heading = el.querySelector('h2, h3');
  if (!heading) {
    el.innerHTML = '<h2>Cookie Preferences</h2><p>Cookie consent management coming soon.</p>';
  }
}
