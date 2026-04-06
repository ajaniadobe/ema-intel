export default function init(el) {
  const rows = [...el.children];
  const grid = document.createElement('div');
  grid.className = 'social-feed-grid';

  rows.forEach((row) => {
    const cols = [...row.children];
    const card = document.createElement('a');
    card.className = 'social-feed-card';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    // First column: image (may contain a link wrapping an image)
    const imgCol = cols[0];
    if (imgCol) {
      const link = imgCol.querySelector('a');
      const img = imgCol.querySelector('img, picture');
      if (link) card.href = link.href;
      if (img) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'social-feed-card-image';
        imgWrapper.append(img);
        card.append(imgWrapper);
      }
    }

    // Second column: title/text
    const textCol = cols[1];
    if (textCol) {
      const title = document.createElement('div');
      title.className = 'social-feed-card-title';
      title.textContent = textCol.textContent.trim();
      card.append(title);
      // Use link from text column if not set from image
      const textLink = textCol.querySelector('a');
      if (!card.href && textLink) card.href = textLink.href;
    }

    // Detect platform from URL
    const href = card.href || '';
    if (href.includes('facebook.com')) {
      card.dataset.platform = 'facebook';
    } else if (href.includes('instagram.com')) {
      card.dataset.platform = 'instagram';
    } else if (href.includes('linkedin.com')) {
      card.dataset.platform = 'linkedin';
    } else if (href.includes('twitter.com') || href.includes('x.com')) {
      card.dataset.platform = 'x';
    }

    grid.append(card);
    row.remove();
  });

  el.textContent = '';
  el.append(grid);
}
