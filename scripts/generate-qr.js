const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const phoneUrl = 'https://bradley8686.github.io/IntelligentRemovalsPro/web/mobile.html';
const outDir = path.join(__dirname, '..', 'marketing');

fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const pngPath = path.join(outDir, 'phone-app-qr.png');
  const svgPath = path.join(outDir, 'phone-app-qr.svg');
  const htmlPath = path.join(outDir, 'phone-app-qr.html');

  await QRCode.toFile(pngPath, phoneUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 10,
    color: {
      dark: '#0b1220',
      light: '#ffffff'
    }
  });

  const svg = await QRCode.toString(phoneUrl, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#0b1220',
      light: '#ffffff'
    }
  });
  fs.writeFileSync(svgPath, svg);

  fs.writeFileSync(htmlPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Intelligent Removals Pro QR Code</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f4f7fb; color: #0b1220; }
    main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    section { width: min(520px, 100%); background: white; border: 1px solid #d9e2ef; border-radius: 12px; padding: 26px; text-align: center; }
    img { width: min(340px, 86vw); height: auto; }
    h1 { margin: 16px 0 8px; font-size: 26px; }
    p { color: #41516a; line-height: 1.45; }
    a { color: #1f66e5; word-break: break-all; }
    @media print { body { background: white; } section { border: 0; } }
  </style>
</head>
<body>
  <main>
    <section>
      <img src="./phone-app-qr.png" alt="QR code for Intelligent Removals Pro phone app" />
      <h1>Intelligent Removals Pro</h1>
      <p>Scan to open the phone survey app.</p>
      <p><a href="${phoneUrl}">${phoneUrl}</a></p>
    </section>
  </main>
</body>
</html>
`);

  console.log(`Created ${pngPath}`);
  console.log(`Created ${svgPath}`);
  console.log(`Created ${htmlPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
