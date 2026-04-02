/**
 * Download editorial images locally for EDS preview
 * Stores in /media/intel/{subfolder}/ served by aem up
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';

const MEDIA_ROOT = './media/intel';

function cleanFilename(url) {
  try {
    const u = new URL(url);
    let name = u.pathname.split('/').pop();
    name = name.replace(/:\d+-\d+$/, '');
    name = name.replace(/\.(thumb\.)?\d+\.\d+/g, '');
    if (!extname(name)) {
      const fmt = u.searchParams.get('fmt');
      if (fmt) {
        const ext = fmt.replace('webp-alpha', 'webp').replace('png-alpha', 'png');
        name = `${name}.${ext}`;
      } else {
        name = `${name}.jpg`;
      }
    }
    return name;
  } catch {
    return basename(url).replace(/[?#].*$/, '') || 'image.jpg';
  }
}

function getSubfolder(url) {
  if (url.includes('homepage-') || url.includes('homepage.')) return 'homepage';
  if (url.includes('gaming-') || url.includes('gamer') || url.includes('esport') || url.includes('lifestyle-male')) return 'gaming';
  if (url.includes('ai-') || url.includes('artificial-intelligence') || url.includes('openvino') || url.includes('oneapi') || url.includes('dcai-') || url.includes('abstract-tech')) return 'ai';
  if (url.includes('support') || url.includes('homepage-product')) return 'support';
  if (url.includes('developer') || url.includes('devzone') || url.includes('quartus') || url.includes('tool-thumbnail')) return 'developer';
  if (url.includes('corporate') || url.includes('responsibility') || url.includes('conversation-icon')) return 'corporate';
  return 'shared';
}

function downloadImage(url, localPath) {
  let cleanUrl = url.replace(/&#x26;/g, '&');
  if (cleanUrl.includes('scene7.com')) {
    // Request largest rendition
    const base = cleanUrl.replace(/\?.*$/, '').replace(/:\d+-\d+$/, '');
    cleanUrl = base;
  }
  try {
    execSync(`curl -sL -o "${localPath}" "${cleanUrl}"`, { timeout: 30000 });
    const stat = statSync(localPath);
    return stat.size > 100; // Ensure not empty
  } catch {
    return false;
  }
}

function collectImageUrls() {
  const contentDir = './content';
  const urlMap = {}; // url → [files that reference it]

  function scanDir(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.plain.html')) {
        const html = readFileSync(fullPath, 'utf-8');
        for (const m of html.matchAll(/src="([^"]+)"/g)) {
          const src = m[1].replace(/&#x26;/g, '&');
          if (src.includes('scene7.com/is/image/') ||
              (src.includes('intel.com/content/dam/') && !src.includes('logos/'))) {
            if (!urlMap[src]) urlMap[src] = [];
            urlMap[src].push(fullPath);
          }
        }
      }
    }
  }

  scanDir(contentDir);
  return urlMap;
}

function updateContentReferences(urlToLocal) {
  const contentDir = './content';

  function processDir(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        processDir(fullPath);
      } else if (entry.name.endsWith('.plain.html')) {
        let html = readFileSync(fullPath, 'utf-8');
        let changed = false;
        for (const [originalUrl, localPath] of Object.entries(urlToLocal)) {
          // Match both raw and HTML-encoded versions
          const escaped = originalUrl.replace(/&/g, '&#x26;');
          if (html.includes(originalUrl)) {
            html = html.replaceAll(originalUrl, localPath);
            changed = true;
          }
          if (html.includes(escaped)) {
            html = html.replaceAll(escaped, localPath);
            changed = true;
          }
        }
        if (changed) {
          writeFileSync(fullPath, html);
          console.log(`  Updated: ${fullPath}`);
        }
      }
    }
  }

  processDir(contentDir);
}

async function main() {
  console.log('=== Download Intel Images Locally ===\n');

  console.log('1. Collecting image URLs from content files...');
  const urlMap = collectImageUrls();
  const urls = Object.keys(urlMap);
  console.log(`   Found ${urls.length} editorial images.\n`);

  console.log('2. Creating local media folders...');
  const folders = ['homepage', 'gaming', 'ai', 'support', 'developer', 'corporate', 'shared'];
  for (const f of folders) {
    mkdirSync(join(MEDIA_ROOT, f), { recursive: true });
  }
  console.log('   Done.\n');

  console.log('3. Downloading images...');
  const urlToLocal = {};
  let success = 0;
  let failed = 0;

  for (const [idx, url] of urls.entries()) {
    const filename = cleanFilename(url);
    const subfolder = getSubfolder(url);
    const localDir = join(MEDIA_ROOT, subfolder);
    const localPath = join(localDir, filename);
    const servePath = `/media/intel/${subfolder}/${filename}`;

    process.stdout.write(`  [${idx + 1}/${urls.length}] ${filename}...`);

    if (existsSync(localPath)) {
      console.log(' exists');
      urlToLocal[url] = servePath;
      success++;
      continue;
    }

    if (downloadImage(url, localPath)) {
      console.log(' ✅');
      urlToLocal[url] = servePath;
      success++;
    } else {
      console.log(' ❌');
      failed++;
    }
  }

  console.log(`\n   Downloaded: ${success}, Failed: ${failed}\n`);

  console.log('4. Updating content file image references...');
  updateContentReferences(urlToLocal);

  console.log(`\n=== Done ===`);
  console.log(`${success} images stored in ${MEDIA_ROOT}/`);
  console.log(`Content files updated to reference /media/intel/ paths`);

  writeFileSync('./migration-work/local-asset-map.json', JSON.stringify(urlToLocal, null, 2));
}

main().catch(console.error);
