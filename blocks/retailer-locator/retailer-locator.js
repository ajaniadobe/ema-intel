export default function init(el) {
  el.style.backgroundColor = '#000';
  el.style.color = '#fff';
  el.style.padding = '48px 24px';
  el.style.textAlign = 'center';

  const heading = el.querySelector('h2, h3');
  if (!heading) {
    el.innerHTML = '<h2>Where to Buy</h2><p>Retailer locator coming soon. Visit intel.com/buy for current options.</p>';
  }
}
