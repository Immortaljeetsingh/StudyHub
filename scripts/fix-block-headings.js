#!/usr/bin/env node
/**
 * scripts/fix-block-headings.js
 * Moves <h2 id="blockN"> headings OUTSIDE the previous .unit div.
 *
 * Bug: <h2 id="block2"> appears BEFORE </div> that closes the previous unit,
 *      so the block heading is inside the unit div.
 * Fix: Move </div> before the <h2>, so block headings sit between units.
 *
 * Run: node scripts/fix-block-headings.js
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

  // Pattern: <h2 id="blockN">...</h2> ... </div> ... <div class="unit" id="uN">
  // The </div> closes the PREVIOUS unit, but it comes AFTER the <h2>.
  // We need to move </div> BEFORE the <h2>.
  //
  // Match: <h2 id="blockN">...</h2> (possibly with whitespace/comments) then </div> then <div class="unit"
  // Replace with: </div> <h2 id="blockN">...</h2> <div class="unit"
  html = html.replace(
    /(<h2 id="block\d+"[^>]*>[\s\S]*?<\/h2>\s*(?:<!--[\s\S]*?-->\s*)?)<\/div>\s*(<div class="unit")/g,
    '</div>\n$1\n$2'
  );

  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    count++;
    console.log(`  OK    ${file}`);
  }
}

console.log(`\nFixed ${count}/${files.length} files`);
