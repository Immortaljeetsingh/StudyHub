#!/usr/bin/env node
/**
 * scripts/fix-mobile-overlay.js
 * Removes broken inline body::after particle overlays from study pages.
 * These overlays use z-index: 0 which paints them ON TOP of content on mobile.
 * Run: node scripts/fix-mobile-overlay.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const files = fs.readdirSync(ROOT).filter(f => /^study-(mmpc|mmph|mmpm|mmpo|mmpf|mmpb)\d{2}(-expanded)?\.html$/.test(f));

let count = 0;

for (const file of files) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;

  // Remove all inline body::after / body.subject-*::after particle blocks
  // Matches both background-image: and background: shorthand with radial-gradient
  html = html.replace(
    /body(?:\.[a-z-]+)?::after\s*\{[^}]*background(?:-image)?:\s*[\s\S]*?radial-gradient[\s\S]*?\}/g,
    '/* particle overlay removed - was breaking mobile */'
  );
  // Remove @keyframes particleDrift and particleDrift2
  html = html.replace(
    /@keyframes particleDrift\d?\s*\{[\s\S]*?\}/g,
    ''
  );

  // Also remove duplicate .visual-diagram block (keep first, remove second)
  const vdMatches = [...html.matchAll(/\.visual-diagram\s*\{[^}]*\}/gs)];
  if (vdMatches.length > 1) {
    const second = vdMatches[1];
    html = html.slice(0, second.index) + html.slice(second.index + second[0].length);
  }

  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    count++;
    console.log(`  OK    ${file}`);
  }
}

console.log(`\nFixed ${count}/${files.length} files`);
