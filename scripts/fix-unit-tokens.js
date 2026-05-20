#!/usr/bin/env node
/**
 * scripts/fix-unit-tokens.js
 * Fixes PowerShell escape artifacts (`n and `r`n) in study HTML files.
 * Run: node scripts/fix-unit-tokens.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const files = fs.readdirSync(ROOT).filter(f => /^study-(mmpc|mmph|mmpm|mmpo|mmpf|mmpb)\d{2}(-expanded)?\.html$/.test(f));

let totalReplacements = 0;
let fixedFiles = 0;
let skippedFiles = 0;

for (const file of files) {
  const filePath = path.join(ROOT, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;

  // Count backtick-n artifacts before fix
  const crlfMatches = (content.match(/`r`n/g) || []).length;
  const lfMatches = (content.match(/`n/g) || []).length - crlfMatches; // subtract CRLF matches that contain `n
  const totalMatches = crlfMatches + lfMatches;

  // Fix: replace CRLF artifact first, then LF artifact
  content = content.replace(/`r`n/g, '\n').replace(/`n/g, '\n');

  // Sanity check: count <div class="unit" opens vs closes
  const unitDivOpens = (content.match(/<div class="unit"[^>]*>/g) || []).length;

  // Count </div> — we can't do a perfect balance check per-unit without a parser,
  // but we can verify the total unit div count is reasonable
  if (unitDivOpens === 0 && totalMatches > 0) {
    console.warn(`  WARN  ${file}: had ${totalMatches} replacements but no unit divs found`);
  }

  if (content !== before) {
    // Preserve BOM if originally present
    const hadBOM = before.charCodeAt(0) === 0xFEFF;
    const writeContent = hadBOM ? '\uFEFF' + content : content;

    fs.writeFileSync(filePath, writeContent, 'utf8');
    fixedFiles++;
    totalReplacements += totalMatches;
    console.log(`  OK    ${file}: ${totalMatches} replacements`);
  } else {
    skippedFiles++;
  }
}

console.log(`\nFixed ${fixedFiles}/${files.length} files, ${totalReplacements} occurrences replaced`);
if (skippedFiles > 0) {
  console.log(`(${skippedFiles} files had no artifacts)`);
}
