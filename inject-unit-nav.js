#!/usr/bin/env node
/**
 * inject-unit-nav.js
 * Adds a mobile <details> unit jump menu to all study-*.html files.
 * Extracts unit info from sidebar <a href="#uN"> links or <div class="unit" id="uN">.
 * Run: node inject-unit-nav.js
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const files = fs.readdirSync(DIR).filter(f => /^study-.*\.html$/.test(f));

let updated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already has unit-nav-mobile
  if (html.includes('unit-nav-mobile')) {
    console.log(`  SKIP  ${file} (already has unit-nav-mobile)`);
    skipped++;
    continue;
  }

  // Strategy 1: Extract from sidebar links <a href="#uN">Label</a>
  const sidebarRegex = /<a\s+href="#(u\d+)"[^>]*>(.*?)<\/a>/gi;
  const units = [];
  let match;
  while ((match = sidebarRegex.exec(html)) !== null) {
    const label = match[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
    // Skip if it's a "Back to" link or empty
    if (label && !label.toLowerCase().includes('back to') && !label.toLowerCase().includes('quiz')) {
      units.push({ id: match[1], label });
    }
  }

  // Strategy 2: If no sidebar links, extract from <div class="unit" id="uN">
  if (units.length === 0) {
    const unitDivRegex = /<div\s+class="unit"\s+id="(u\d+)"[^>]*>/gi;
    while ((match = unitDivRegex.exec(html)) !== null) {
      units.push({ id: match[1], label: `Unit ${match[1].slice(1)}` });
    }
  }

  if (units.length === 0) {
    console.log(`  SKIP  ${file} (no units found)`);
    skipped++;
    continue;
  }

  // Build the <details> nav block
  const navLinks = units.map(u =>
    `      <a href="#${u.id}">${u.label}</a>`
  ).join('\n');

  const navBlock = `
  <!-- Mobile unit jump menu (auto-injected) -->
  <details class="unit-nav-mobile">
    <summary>\u{1F4DA} Jump to unit \u25BE</summary>
    <nav>
${navLinks}
    </nav>
  </details>
`;

  // Find inject point: after <main> or after .study-layout opening tag
  let injectPoint = html.indexOf('<main');
  if (injectPoint === -1) {
    injectPoint = html.indexOf('class="study-layout"');
  }
  if (injectPoint === -1) {
    injectPoint = html.indexOf('<body');
  }

  if (injectPoint === -1) {
    console.log(`  SKIP  ${file} (no inject point found)`);
    skipped++;
    continue;
  }

  // Find the end of the opening tag
  const tagEnd = html.indexOf('>', injectPoint);
  if (tagEnd === -1) {
    console.log(`  SKIP  ${file} (malformed HTML)`);
    skipped++;
    continue;
  }

  // Insert the nav block after the opening tag
  html = html.slice(0, tagEnd + 1) + '\n' + navBlock + html.slice(tagEnd + 1);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  OK    ${file} (${units.length} units)`);
  updated++;
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${files.length} total`);
