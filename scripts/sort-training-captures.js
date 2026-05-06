const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const inbox = path.join(root, 'training', 'inbox');
const raw = path.join(root, 'training', 'dataset', 'raw');
const labels = fs.readFileSync(path.join(root, 'training', 'labels.txt'), 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

fs.mkdirSync(inbox, { recursive: true });
fs.mkdirSync(raw, { recursive: true });
labels.forEach((label) => fs.mkdirSync(path.join(raw, label), { recursive: true }));

const files = fs.readdirSync(inbox).filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));
let moved = 0;

for (const file of files) {
  const lower = file.toLowerCase();
  const label = labels.find((candidate) => lower.startsWith(`training_${candidate.toLowerCase()}_`));
  if (!label) {
    console.log(`Skipping ${file}: no label match`);
    continue;
  }
  fs.renameSync(path.join(inbox, file), path.join(raw, label, file));
  moved += 1;
  console.log(`Moved ${file} -> ${label}`);
}

console.log(`Done. Moved ${moved} file(s).`);
