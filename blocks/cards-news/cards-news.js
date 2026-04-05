export default function init(el) {
  const ul = document.createElement('ul');
  [...el.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-news-card-image';
      } else {
        div.className = 'cards-news-card-body';
      }
    });
    ul.append(li);
  });
  el.textContent = '';
  el.append(ul);

  // Fix YouTube auto-embed: find video wrappers and restore as links
  el.querySelectorAll('li').forEach((li) => {
    const video = li.querySelector('.video');
    if (!video) return;

    const body = li.querySelector('.cards-news-card-body');
    if (!body) return;

    // Extract YouTube URL from iframe or data-src
    const iframe = video.querySelector('iframe');
    const dataSrc = video.dataset.src || '';
    const src = iframe?.src || dataSrc;
    const ytMatch = src.match(/youtube[^/]*\/embed\/([^?]+)/);

    // Find the empty last <p> where the link was
    const lastP = body.querySelector('p:last-child');
    if (lastP && !lastP.querySelector('a')) {
      const link = document.createElement('a');
      link.href = ytMatch
        ? `https://www.youtube.com/watch?v=${ytMatch[1]}`
        : src || '#';
      link.textContent = lastP.textContent.trim() || 'Watch the review';
      lastP.textContent = '';
      lastP.append(link);
    }

    video.remove();
  });
}
