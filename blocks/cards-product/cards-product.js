export default function init(el) {
  const ul = document.createElement('ul');
  [...el.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-product-card-image';
      } else {
        div.className = 'cards-product-card-body';
      }
    });
    ul.append(li);
  });
  el.textContent = '';
  el.append(ul);
}
