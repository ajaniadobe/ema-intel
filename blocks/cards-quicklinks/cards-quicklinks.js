export default function init(el) {
  const ul = document.createElement('ul');
  [...el.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const hasPicture = div.querySelector('picture');
      const hasOnlyImg = div.children.length === 1 && div.querySelector('img');
      if (hasPicture || hasOnlyImg) {
        div.className = 'cards-quicklinks-card-image';
      } else {
        div.className = 'cards-quicklinks-card-body';
      }
    });
    ul.append(li);
  });
  el.textContent = '';
  el.append(ul);

  // Fix icon URLs: rewrite external intel.com icon paths to local /icons/ path
  el.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || img.src || '';
    const match = src.match(/icons\/([^/?]+\.svg)/);
    if (match && (src.includes('intel.com') || img.naturalWidth === 0)) {
      img.src = `/icons/${match[1]}`;
    }
  });
}
