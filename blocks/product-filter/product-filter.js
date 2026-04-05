export default function init(el) {
  const rows = [...el.children];
  const categories = [];

  // Each row is a category: first div = category name, second div = list of products
  rows.forEach((row) => {
    const cols = [...row.children];
    const categoryName = cols[0]?.textContent?.trim() || '';
    const productsDiv = cols[1];

    const products = [];
    if (productsDiv) {
      const links = productsDiv.querySelectorAll('a');
      links.forEach((a) => {
        products.push({ text: a.textContent.trim(), href: a.href });
      });
      // Also check for plain text items (non-link items)
      if (links.length === 0) {
        const items = productsDiv.querySelectorAll('li, p');
        items.forEach((item) => {
          const link = item.querySelector('a');
          if (link) {
            products.push({ text: link.textContent.trim(), href: link.href });
          } else if (item.textContent.trim()) {
            products.push({ text: item.textContent.trim(), href: '' });
          }
        });
      }
    }

    if (categoryName || products.length) {
      categories.push({ name: categoryName, products });
    }
    row.remove();
  });

  // Build filter UI
  const container = document.createElement('div');
  container.className = 'product-filter-container';

  // Search input
  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'product-filter-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Filter products...';
  searchInput.className = 'product-filter-input';
  searchWrapper.append(searchInput);
  container.append(searchWrapper);

  // Category sections
  const listContainer = document.createElement('div');
  listContainer.className = 'product-filter-categories';

  categories.forEach((cat) => {
    const section = document.createElement('div');
    section.className = 'product-filter-category';

    if (cat.name) {
      const heading = document.createElement('h3');
      heading.className = 'product-filter-category-name';
      heading.textContent = cat.name;

      const toggle = document.createElement('button');
      toggle.className = 'product-filter-toggle';
      toggle.setAttribute('aria-label', `Toggle ${cat.name}`);
      toggle.textContent = '−';
      heading.append(toggle);

      heading.addEventListener('click', () => {
        section.classList.toggle('is-collapsed');
        toggle.textContent = section.classList.contains('is-collapsed') ? '+' : '−';
      });

      section.append(heading);
    }

    const ul = document.createElement('ul');
    ul.className = 'product-filter-list';
    cat.products.forEach((prod) => {
      const li = document.createElement('li');
      if (prod.href) {
        const a = document.createElement('a');
        a.href = prod.href;
        a.textContent = prod.text;
        li.append(a);
      } else {
        li.textContent = prod.text;
      }
      ul.append(li);
    });
    section.append(ul);
    listContainer.append(section);
  });

  container.append(listContainer);
  el.textContent = '';
  el.append(container);

  // Search filter
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    listContainer.querySelectorAll('.product-filter-category').forEach((cat) => {
      let hasMatch = false;
      cat.querySelectorAll('li').forEach((li) => {
        const matches = li.textContent.toLowerCase().includes(query);
        li.style.display = matches ? '' : 'none';
        if (matches) hasMatch = true;
      });
      cat.style.display = hasMatch || !query ? '' : 'none';
      // Expand collapsed sections when searching
      if (query && hasMatch) cat.classList.remove('is-collapsed');
    });
  });
}
