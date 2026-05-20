#!/usr/bin/env node
/**
 * scripts/clean-subject-pages.js
 * Strips dead stylesheets, inline <style> blocks, and old theme classes
 * from all subject study/quiz pages. Runs once.
 *
 * Run: node scripts/clean-subject-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const DEAD_STYLESHEETS = [
  'styles-enhanced.css',
  'study-hub-enhanced.css',
  'enhancements.css',
  'revision-mode.css',
  'light-theme.css',
  'components.css',
  'study-hub-global-fixes.css'
];

const files = fs.readdirSync(ROOT).filter(f =>
  /^study-(mmpc|mmph|mmpm|mmpo|mmpf|mmpb)\d{2}(-expanded)?\.html$/.test(f) ||
  /^quiz-(mmpc|mmph|mmpm|mmpo|mmpf|mmpb)\d{2}\.html$/.test(f) ||
  f === 'quiz-results.html' ||
  f === 'flashcards.html' ||
  f === 'index.html'
);

let totalChanges = 0;
let filesModified = 0;

for (const file of files) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;
  let changes = 0;

  // ─── Step 1: Remove dead stylesheet links ───
  for (const css of DEAD_STYLESHEETS) {
    const re = new RegExp(`\\s*<link[^>]*href=["']${css}["'][^>]*>\\s*`, 'gi');
    const matches = html.match(re);
    if (matches) {
      html = html.replace(re, '\n');
      changes += matches.length;
    }
  }

  // ─── Step 2: Remove inline <style> block ───
  // The inline style is the first <style>...</style> in <head> that isn't inside a <script>
  // It contains particle overlay, hardcoded colors, !important rules
  // We keep <style> blocks that are JSON-LD or other non-CSS
  const styleRegex = /<style(?![^>]*type\s*=\s*["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/style>/gi;
  const styleMatches = html.match(styleRegex);
  if (styleMatches) {
    // Only remove the first inline <style> (the one in <head> with CSS)
    // Keep any that are JSON-LD or have specific types
    for (const match of styleMatches) {
      if (!match.includes('application/ld+json') && !match.includes('application/json')) {
        html = html.replace(match, '');
        changes++;
        break; // Only remove the first one
      }
    }
  }

  // ─── Step 3: Convert old theme toggle ───
  // Replace body.classList.toggle('light-theme') with data-theme approach
  html = html.replace(
    /document\.body\.classList\.toggle\(['"]light-theme['"]\)/g,
    `(function(){var t=document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';document.documentElement.setAttribute('data-theme',t);try{localStorage.setItem('studyhub-theme',t)}catch(e){}})()`
  );
  html = html.replace(
    /document\.body\.classList\.add\(['"]light-theme['"]\)/g,
    `document.documentElement.setAttribute('data-theme','light')`
  );
  html = html.replace(
    /document\.body\.classList\.remove\(['"]light-theme['"]\)/g,
    `document.documentElement.setAttribute('data-theme','dark')`
  );
  html = html.replace(
    /document\.body\.classList\.contains\(['"]light-theme['"]\)/g,
    `document.documentElement.getAttribute('data-theme')==='light'`
  );

  // Remove any <body class="light-theme"> — should just be <body> or <body class="subject-*">
  html = html.replace(
    /<body\s+class="light-theme">/g,
    '<body>'
  );
  // Fix <body class="subject-XX light-theme"> to just <body class="subject-XX">
  html = html.replace(
    /<body\s+class="(subject-[a-z0-9]+)\s+light-theme">/g,
    '<body class="$1">'
  );
  html = html.replace(
    /<body\s+class="light-theme\s+(subject-[a-z0-9]+)">/g,
    '<body class="$1">'
  );

  // ─── Step 4: Remove dead JS file references ───
  // Remove script tags for old JS files that are now consolidated into app.js
  const DEAD_SCRIPTS = ['search.js', 'sidebar.js', 'enhancements.js'];
  for (const js of DEAD_SCRIPTS) {
    const re = new RegExp(`\\s*<script[^>]*src=["']${js}["'][^>]*>\\s*<\\/script>\\s*`, 'gi');
    if (re.test(html)) {
      html = html.replace(re, '\n');
      changes++;
    }
  }

  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    filesModified++;
    totalChanges += changes;
    console.log(`  OK    ${file} (${changes} changes)`);
  }
}

console.log(`\nCleaned ${filesModified}/${files.length} files, ${totalChanges} total changes`);
