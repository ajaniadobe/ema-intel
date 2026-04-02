/**
 * Asset migration script for Intel → AEM DAM
 * Downloads editorial images and uploads to /content/dam/ema-intel
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { basename, extname, join } from 'path';

const AEM_HOST = process.env.AEM_HOST || 'https://author-p142404-e1461571.adobeaemcloud.com';
const DAM_ROOT = process.env.DAM_ROOT || '/content/dam/ema-intel';
const CLIENT_ID = process.env.AEM_CLIENT_ID || '';
const CLIENT_SECRET = process.env.AEM_CLIENT_SECRET || '';
const ORG_ID = process.env.AEM_ORG_ID || '';

// Get access token
function getToken() {
  const result = execSync(`curl -s -X POST "https://ims-na1.adobelogin.com/ims/token/v3" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=client_credentials" \
    -d "client_id=${CLIENT_ID}" \
    -d "client_secret=${CLIENT_SECRET}" \
    -d "scope=openid,AdobeID,aem.folders,aem.fragments.management"`, { encoding: 'utf-8' });
  return JSON.parse(result).access_token;
}

// Clean filename: strip size parameters like :1920-1080, ?wid=..., thumb.120.120, 1024.1024
function cleanFilename(url) {
  try {
    const u = new URL(url);
    let name = u.pathname.split('/').pop();
    // Remove rendition suffixes like :1920-1080 or :1080-1080
    name = name.replace(/:\d+-\d+$/, '');
    // Remove size patterns like .thumb.120.120 or .1024.1024
    name = name.replace(/\.(thumb\.)?\d+\.\d+/g, '');
    // Add extension if missing
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

// Determine subfolder based on which page uses the image
function getSubfolder(url, pageContext) {
  if (url.includes('homepage-') || url.includes('homepage.')) return 'homepage';
  if (url.includes('gaming-') || url.includes('gamer') || url.includes('esport')) return 'gaming';
  if (url.includes('ai-') || url.includes('artificial-intelligence') || url.includes('openvino') || url.includes('oneapi')) return 'ai';
  if (url.includes('support') || url.includes('homepage-product')) return 'support';
  if (url.includes('developer') || url.includes('devzone') || url.includes('quartus') || url.includes('tool-thumbnail')) return 'developer';
  if (url.includes('corporate') || url.includes('responsibility') || url.includes('conversation-icon')) return 'corporate';
  if (url.includes('marquee') || url.includes('dcai-') || url.includes('abstract-tech')) return 'shared';
  return 'shared';
}

// Create folder in DAM
function createFolder(token, folderPath) {
  const parentPath = folderPath.split('/').slice(0, -1).join('/');
  const folderName = folderPath.split('/').pop();

  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" -X POST "${AEM_HOST}/api/assets${parentPath}" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      -H "x-api-key: ${CLIENT_ID}" \
      -d '{"class":"assetFolder","properties":{"title":"${folderName}"}}'`, { encoding: 'utf-8' });
    console.log(`  Folder ${folderPath}: ${result.trim()}`);
    return true;
  } catch (e) {
    console.log(`  Folder ${folderPath}: exists or error`);
    return false;
  }
}

// Download image to local temp
function downloadImage(url, localPath) {
  // Get largest rendition by requesting without size params
  let cleanUrl = url.replace(/&#x26;/g, '&');
  // For scene7 images, request largest rendition
  if (cleanUrl.includes('scene7.com')) {
    cleanUrl = cleanUrl.replace(/\?.*$/, '');
    // Remove rendition suffix
    cleanUrl = cleanUrl.replace(/:\d+-\d+$/, '');
  }

  try {
    execSync(`curl -sL -o "${localPath}" "${cleanUrl}"`, { timeout: 30000 });
    return true;
  } catch (e) {
    console.log(`  Download failed: ${url}`);
    return false;
  }
}

// Upload to AEM DAM
function uploadAsset(token, localPath, damPath) {
  const filename = basename(localPath);
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" -X POST "${AEM_HOST}/api/assets${damPath}" \
      -H "Authorization: Bearer ${token}" \
      -H "x-api-key: ${CLIENT_ID}" \
      -F "file=@${localPath}" \
      -F "name=${filename}"`, { encoding: 'utf-8', timeout: 60000 });
    return result.trim();
  } catch (e) {
    return 'error';
  }
}

// Collect all editorial image URLs from content files
function collectImageUrls() {
  const contentDir = './content';
  const urls = new Set();

  function scanDir(dir) {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.plain.html')) {
        const html = readFileSync(fullPath, 'utf-8');
        const matches = html.matchAll(/src="([^"]+)"/g);
        for (const m of matches) {
          const src = m[1].replace(/&#x26;/g, '&');
          // Only editorial images (scene7 + intel.com/content/dam), skip scripts/icons/data-uri
          if (src.includes('scene7.com/is/image/') ||
              (src.includes('intel.com/content/dam/') && !src.includes('logos/'))) {
            urls.add(src);
          }
        }
      }
    }
  }

  scanDir(contentDir);
  return [...urls];
}

// Main
async function main() {
  console.log('=== Intel Asset Migration to AEM DAM ===\n');

  console.log('1. Getting access token...');
  const token = getToken();
  console.log('   Token obtained.\n');

  console.log('2. Collecting editorial images from content files...');
  const urls = collectImageUrls();
  console.log(`   Found ${urls.length} editorial images.\n`);

  console.log('3. Creating DAM folder structure...');
  const folders = ['homepage', 'gaming', 'ai', 'support', 'developer', 'corporate', 'shared'];
  createFolder(token, `${DAM_ROOT}`);
  for (const f of folders) {
    createFolder(token, `${DAM_ROOT}/${f}`);
  }
  console.log('');

  console.log('4. Downloading and uploading images...');
  const tmpDir = '/tmp/intel-assets';
  mkdirSync(tmpDir, { recursive: true });

  const results = { success: 0, failed: 0, skipped: 0 };
  const assetMap = {};

  for (const [idx, url] of urls.entries()) {
    const filename = cleanFilename(url);
    const subfolder = getSubfolder(url);
    const localPath = join(tmpDir, filename);
    const damFolder = `${DAM_ROOT}/${subfolder}`;

    console.log(`  [${idx + 1}/${urls.length}] ${filename} → ${damFolder}/`);

    if (downloadImage(url, localPath)) {
      const status = uploadAsset(token, localPath, damFolder);
      if (status === '200' || status === '201') {
        console.log(`    ✅ Uploaded (${status})`);
        results.success++;
        assetMap[url] = `${AEM_HOST}${damFolder}/${filename}`;
      } else if (status === '409') {
        console.log(`    ⏭️  Already exists`);
        results.skipped++;
        assetMap[url] = `${AEM_HOST}${damFolder}/${filename}`;
      } else {
        console.log(`    ❌ Upload failed (${status})`);
        results.failed++;
      }
    } else {
      results.failed++;
    }
  }

  console.log(`\n=== Migration Summary ===`);
  console.log(`Uploaded: ${results.success}`);
  console.log(`Already existed: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total: ${urls.length}`);

  // Save asset mapping for reference
  writeFileSync('./migration-work/asset-map.json', JSON.stringify(assetMap, null, 2));
  console.log('\nAsset map saved to migration-work/asset-map.json');
}

main().catch(console.error);
