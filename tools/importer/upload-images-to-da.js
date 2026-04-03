/**
 * Upload images to DA as media files and update content references.
 * DA stores images as media_<hash>.<ext> files at the same level as the content.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, basename, extname } from 'path';

const DA_ORG = 'ajaniadobe';
const DA_SITE = 'ema-intel';
const DA_BASE = `https://admin.da.live/source/${DA_ORG}/${DA_SITE}`;
const DA_TOKEN = process.env.DA_TOKEN;
const MEDIA_ROOT = './media/intel';

if (!DA_TOKEN) {
  console.error('Set DA_TOKEN env var');
  process.exit(1);
}

function collectImages() {
  const images = [];
  const subfolders = readdirSync(MEDIA_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
  for (const sub of subfolders) {
    const dir = join(MEDIA_ROOT, sub);
    for (const file of readdirSync(dir)) {
      const ext = extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
        images.push({
          localPath: join(dir, file),
          filename: file,
          subfolder: sub,
        });
      }
    }
  }
  return images;
}

function uploadToDA(localPath, daPath) {
  const mimeTypes = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
  };
  const ext = extname(localPath).toLowerCase();
  const mime = mimeTypes[ext] || 'application/octet-stream';

  try {
    const result = execSync(`curl -s -w "\\n%{http_code}" -X PUT "${DA_BASE}${daPath}" \
      -H "Authorization: Bearer ${DA_TOKEN}" \
      -H "Content-Type: ${mime}" \
      --data-binary @"${localPath}"`, { encoding: 'utf-8', timeout: 30000 });

    const lines = result.trim().split('\n');
    const code = lines[lines.length - 1];
    const body = lines.slice(0, -1).join('\n');
    return { code, body };
  } catch (e) {
    return { code: 'error', body: e.message?.substring(0, 80) };
  }
}

function buildOriginalUrlMap() {
  // Map local paths → original URLs
  const localAssetMap = JSON.parse(readFileSync('./migration-work/local-asset-map.json', 'utf-8'));
  // localAssetMap: { originalUrl: "/media/intel/subfolder/filename" }
  const reverseMap = {};
  for (const [origUrl, localPath] of Object.entries(localAssetMap)) {
    reverseMap[localPath] = origUrl;
  }
  return reverseMap;
}

async function main() {
  console.log('=== Upload Images to DA ===\n');

  const images = collectImages();
  console.log(`Found ${images.length} images to upload.\n`);

  const reverseMap = buildOriginalUrlMap();
  const daMediaMap = {}; // originalUrl → DA media path
  let success = 0;
  let failed = 0;

  for (const [idx, img] of images.entries()) {
    const daPath = `/${img.filename}`;
    const size = statSync(img.localPath).size;
    process.stdout.write(`  [${idx + 1}/${images.length}] ${img.filename} (${Math.round(size / 1024)}KB)...`);

    const result = uploadToDA(img.localPath, daPath);
    if (result.code === '201' || result.code === '200') {
      console.log(` ✅ ${result.code}`);
      // Map the original URL to the DA-served path
      const localMediaPath = `/media/intel/${img.subfolder}/${img.filename}`;
      const originalUrl = reverseMap[localMediaPath];
      if (originalUrl) {
        // DA serves uploaded media at /<filename> relative to the site
        daMediaMap[originalUrl] = `/${img.filename}`;
      }
      success++;
    } else {
      console.log(` ❌ ${result.code}`);
      failed++;
    }
  }

  console.log(`\nUploaded: ${success}, Failed: ${failed}\n`);

  // Now update content files to use simple /<filename> references
  console.log('Updating content files...');
  const contentFiles = [
    'content/homepage.plain.html',
    'content/gaming/serious-gaming.plain.html',
    'content/artificial-intelligence/overview.plain.html',
    'content/products/overview.plain.html',
    'content/developer/overview.plain.html',
    'content/support.plain.html',
    'content/corporate-responsibility/corporate-responsibility.plain.html',
  ];

  for (const file of contentFiles) {
    if (!existsSync(file)) continue;
    let html = readFileSync(file, 'utf-8');
    let changed = false;

    for (const [originalUrl, daPath] of Object.entries(daMediaMap)) {
      // Also handle HTML-encoded versions
      const encoded = originalUrl.replace(/&/g, '&#x26;');
      if (html.includes(originalUrl)) {
        html = html.replaceAll(originalUrl, daPath);
        changed = true;
      }
      if (html.includes(encoded)) {
        html = html.replaceAll(encoded, daPath);
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(file, html);
      console.log(`  Updated: ${file}`);
    }
  }

  writeFileSync('./migration-work/da-media-map.json', JSON.stringify(daMediaMap, null, 2));
  console.log(`\nDA media map saved. Re-upload content files to DA to pick up new image paths.`);
}

main().catch(console.error);
