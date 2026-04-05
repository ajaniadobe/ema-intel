export default function init(el) {
  const ul = document.createElement('ul');
  [...el.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const hasImg = div.querySelector('picture') || div.querySelector('img');
      if (hasImg && div.children.length === 1) {
        div.className = 'support-products-icon';
        // Fix external icon URLs to local paths
        const img = div.querySelector('img');
        if (img) {
          const src = img.getAttribute('src') || '';
          const match = src.match(/icons\/([^/?]+\.svg)/);
          if (match && src.includes('intel.com')) {
            img.src = `/icons/${match[1]}`;
          }
        }
      } else {
        div.className = 'support-products-text';
      }
    });
    ul.append(li);
  });
  el.textContent = '';
  el.append(ul);
}
