import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");

const MAX_IMAGE_SIZE_KB = 350;
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".mp4", ".webm"]);

function scanDirectory(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDirectory(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  console.log("📸 Media Asset Integrity & Weight Check");
  console.log(`Target Directory: ${IMAGES_DIR}\n`);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Error: Directory ${IMAGES_DIR} does not exist.`);
    process.exit(1);
  }

  const allFiles = scanDirectory(IMAGES_DIR);
  let hasWarnings = false;
  let totalBytes = 0;

  for (const file of allFiles) {
    const ext = path.extname(file).toLowerCase();
    const stats = fs.statSync(file);
    const sizeKb = stats.size / 1024;
    totalBytes += stats.size;
    const relPath = path.relative(PUBLIC_DIR, file).replace(/\\/g, "/");

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      console.warn(`⚠️ [Unexpected File Type]: ${relPath} (${ext})`);
      hasWarnings = true;
    }

    if (ext !== ".mp4" && ext !== ".webm" && sizeKb > MAX_IMAGE_SIZE_KB) {
      console.warn(
        `⚠️ [Size Warning]: ${relPath} is ${sizeKb.toFixed(1)} KB (exceeds recommended budget ${MAX_IMAGE_SIZE_KB} KB)`
      );
      hasWarnings = true;
    } else {
      console.log(`✓ ${relPath} (${sizeKb.toFixed(1)} KB)`);
    }
  }

  const totalMb = totalBytes / (1024 * 1024);
  console.log(`\n📊 Total media catalog size: ${totalMb.toFixed(2)} MB (${allFiles.length} files)`);

  if (hasWarnings) {
    console.log("ℹ️ Media check completed with recommendations.");
  } else {
    console.log("✅ All media assets meet size and budget recommendations.");
  }
}

main();
