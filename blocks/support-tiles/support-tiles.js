export default function init(el) {
  const ul = document.createElement('ul');
  [...el.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const hasImg = div.querySelector('picture') || div.querySelector('img');
      if (hasImg && div.children.length === 1) {
        div.className = 'support-tiles-icon';
      } else {
        div.className = 'support-tiles-text';
      }
    });
    ul.append(li);
  });
  el.textContent = '';
  el.append(ul);
}
