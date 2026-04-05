import observe from '../../scripts/utils/observer.js';

function getVideoSrc(url) {
  // YouTube
  const ytMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
    || url.match(/youtu\.be\/([^?]+)/);
  if (ytMatch) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`;
  }

  // Brightcove
  const bcMatch = url.match(/players\.brightcove\.net\/(\d+)\/([^/]+)\/index\.html\?videoId=(\d+)/);
  if (bcMatch) {
    return `https://players.brightcove.net/${bcMatch[1]}/${bcMatch[2]}/index.html?videoId=${bcMatch[3]}`;
  }

  // Generic embed URL (already an embed URL)
  if (url.includes('embed') || url.includes('player')) {
    return url;
  }

  return null;
}

function decorate(el) {
  const { src } = el.dataset;
  if (!src) return;
  el.innerHTML = `<iframe src="${src}"
    class="video-embed-iframe"
    allowfullscreen
    allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"
    scrolling="no"
    title="Video">
  </iframe>`;
}

export default function init(el) {
  const rows = [...el.children];
  el.textContent = '';

  rows.forEach((row) => {
    const link = row.querySelector('a');
    const text = row.textContent.trim();
    const url = link?.href || text;

    const src = getVideoSrc(url);
    if (src) {
      const wrapper = document.createElement('div');
      wrapper.className = 'video-embed-wrapper';
      wrapper.dataset.src = src;
      el.append(wrapper);
      observe(wrapper, decorate);
    } else {
      // If not a recognizable video URL, keep as a link
      const p = document.createElement('p');
      if (link) {
        p.append(link);
      } else {
        p.textContent = text;
      }
      el.append(p);
    }
  });
}
