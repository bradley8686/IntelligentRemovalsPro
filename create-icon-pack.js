// create-icon-pack.js (CommonJS)
// Build a proper icon pack from your rendered logo.
// Requires: icon-gen, sharp, archiver

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const iconGen = require('icon-gen');
const archiver = require('archiver');

(async () => {
  try {
    const root = process.cwd();
    const buildDir = path.join(root, 'build');
    const tmpDir = path.join(buildDir, '__tmp__');
    const srcPreview = path.join(buildDir, 'IntelligentRemovalsPro-preview.jpg'); // your source image
    const srcPng = path.join(tmpDir, 'icon-src-1024.png');

    const outPng = path.join(buildDir, 'IntelligentRemovalsPro-icon.png');   // 512x512
    const outIco = path.join(buildDir, 'IntelligentRemovalsPro-icon.ico');   // windows
    const outIcns = path.join(buildDir, 'IntelligentRemovalsPro-icon.icns'); // mac
    const outZip = path.join(buildDir, 'IntelligentRemovalsPro_IconPack.zip');

    // sanity
    if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
    if (!fs.existsSync(srcPreview)) {
      console.error(`❌ Source not found: ${srcPreview}`);
      process.exit(1);
    }
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    console.log('🎨 Preparing 1024px PNG source...');
    await sharp(srcPreview)
      .resize(1024, 1024, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(srcPng);

    console.log('🖼️ Creating 512×512 PNG...');
    await sharp(srcPreview)
      .resize(512, 512, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(outPng);

    console.log('🪟 Generating ICO & 🍏 ICNS via icon-gen...');
    // icon-gen writes into a folder; we then move/rename outputs
    const genOutDir = path.join(tmpDir, 'icons');
    if (!fs.existsSync(genOutDir)) fs.mkdirSync(genOutDir, { recursive: true });

    await iconGen(srcPng, genOutDir, {
      modes: ['ico', 'icns'],
      names: {
        ico: 'IntelligentRemovalsPro-icon',
        icns: 'IntelligentRemovalsPro-icon'
      },
      report: false
    });

    // move generated files to build/
    const genIco = path.join(genOutDir, 'IntelligentRemovalsPro-icon.ico');
    const genIcns = path.join(genOutDir, 'IntelligentRemovalsPro-icon.icns');

    if (!fs.existsSync(genIco) || !fs.existsSync(genIcns)) {
      console.error('❌ icon-gen did not produce expected files.');
      process.exit(1);
    }
    fs.copyFileSync(genIco, outIco);
    fs.copyFileSync(genIcns, outIcns);

    console.log('📦 Zipping to IntelligentRemovalsPro_IconPack.zip...');
    if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

    const zipStream = fs.createWriteStream(outZip);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(zipStream);

    archive.file(outIco,  { name: path.basename(outIco)  });
    archive.file(outIcns, { name: path.basename(outIcns) });
    archive.file(outPng,  { name: path.basename(outPng)  });
    archive.file(srcPreview, { name: path.basename(srcPreview) });

    await archive.finalize();

    await new Promise((res, rej) => {
      zipStream.on('close', res);
      zipStream.on('error', rej);
    });

    console.log(`✅ Done! ${outZip}`);

    // OPTIONAL: move ZIP to repo root and git add/commit/push
    const moveToRoot = process.argv.includes('--push');
    if (moveToRoot) {
      const destZip = path.join(root, 'IntelligentRemovalsPro_IconPack.zip');
      fs.copyFileSync(outZip, destZip);
      console.log('🚚 Copied ZIP to repo root.');

      // try git commit/push (best-effort)
      try {
        const { execSync } = require('child_process');
        execSync('git add IntelligentRemovalsPro_IconPack.zip', { stdio: 'inherit' });
        execSync('git commit -m "Add Intelligent Removals Pro icon pack (brushed-metal 3D)"', { stdio: 'inherit' });
        execSync('git push', { stdio: 'inherit' });
        console.log('🚀 ZIP pushed to GitHub.');
      } catch (e) {
        console.log('ℹ️ Skipped git push (no remote, or not needed).');
      }
    }

    // cleanup temp
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
