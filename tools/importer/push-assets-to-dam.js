/**
 * Push local images from /media/intel/ to AEM DAM at /content/dam/ema-intel
 * Uses developer token from /tmp/aem_token.txt
 */
import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';

const AEM_HOST = 'https://author-p142404-e1461571.adobeaemcloud.com';
const DAM_ROOT = '/content/dam/ema-intel';
const MEDIA_ROOT = './media/intel';
const TOKEN = readFileSync('/tmp/aem_token.txt', 'utf-8').trim();

function createFolder(folderPath) {
  // Use Sling POST to create folder
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" -X POST "${AEM_HOST}${folderPath}" \
      -H "Authorization: Bearer ${TOKEN}" \
      -F "jcr:primaryType=sling:OrderedFolder" \
      -F "jcr:content/jcr:primaryType=nt:unstructured"`, { encoding: 'utf-8', timeout: 15000 });
    const code = result.trim();
    if (code === '200' || code === '201' || code === '301') {
      console.log(`  ✅ Folder ${folderPath}: ${code}`);
      return true;
    }
    // Check if folder already exists
    const checkResult = execSync(`curl -s -o /dev/null -w "%{http_code}" "${AEM_HOST}${folderPath}.json" \
      -H "Authorization: Bearer ${TOKEN}"`, { encoding: 'utf-8', timeout: 10000 });
    if (checkResult.trim() === '200') {
      console.log(`  ✅ Folder ${folderPath}: exists`);
      return true;
    }
    console.log(`  ❌ Folder ${folderPath}: ${code}`);
    return false;
  } catch (e) {
    console.log(`  ❌ Folder ${folderPath}: error - ${e.message?.substring(0, 60)}`);
    return false;
  }
}

function uploadAsset(localPath, damFolder) {
  const filename = basename(localPath);
  const mimeTypes = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
  };
  const ext = extname(filename).toLowerCase();
  const mime = mimeTypes[ext] || 'application/octet-stream';

  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" \
      -X POST "${AEM_HOST}${damFolder}.createasset.html" \
      -H "Authorization: Bearer ${TOKEN}" \
      -F "fileName=${filename}" \
      -F "file=@${localPath};type=${mime}"`, { encoding: 'utf-8', timeout: 60000 });
    const code = result.trim();
    return code === '200' || code === '201';
  } catch {
    return false;
  }
}

function collectLocalImages() {
  const images = [];
  const subfolders = readdirSync(MEDIA_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const subfolder of subfolders) {
    const dir = join(MEDIA_ROOT, subfolder);
    const files = readdirSync(dir).filter(f => {
      const ext = extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext);
    });
    for (const file of files) {
      images.push({
        localPath: join(dir, file),
        damFolder: `${DAM_ROOT}/${subfolder}`,
        damPath: `${DAM_ROOT}/${subfolder}/${file}`,
        servePath: `/media/intel/${subfolder}/${file}`,
      });
    }
  }
  return images;
}

async function main() {
  console.log('=== Push Local Images to AEM DAM ===\n');

  console.log('1. Collecting local images...');
  const images = collectLocalImages();
  console.log(`   Found ${images.length} images in ${MEDIA_ROOT}/\n`);

  console.log('2. Creating DAM folder structure...');
  createFolder(DAM_ROOT);
  const subfolders = [...new Set(images.map(i => i.damFolder))];
  for (const folder of subfolders) {
    createFolder(folder);
  }
  console.log();

  console.log('3. Uploading images...');
  let success = 0;
  let failed = 0;
  const damMap = {};

  for (const [idx, img] of images.entries()) {
    const filename = basename(img.localPath);
    const size = statSync(img.localPath).size;
    process.stdout.write(`  [${idx + 1}/${images.length}] ${filename} (${Math.round(size / 1024)}KB)...`);

    if (uploadAsset(img.localPath, img.damFolder)) {
      console.log(' ✅');
      damMap[img.servePath] = img.damPath;
      success++;
    } else {
      console.log(' ❌');
      failed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Uploaded: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${images.length}`);

  writeFileSync('./migration-work/dam-asset-map.json', JSON.stringify(damMap, null, 2));
  console.log(`\nDAM asset map saved to migration-work/dam-asset-map.json`);
}

main().catch(console.error);
