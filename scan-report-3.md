# Scan Report 3 — Deep Bug Scan

**Generated:** 2026-05-17T16:24:05.379Z
**Files Scanned:** 11

## Summary

| File | Lines | Size | Bugs | Warnings |
|------|-------|------|------|----------|
| study-mmpc06.html | 1932 | 124.9KB | ✅ 0 | 🟡 2 |
| study-mmpc07.html | 1698 | 117.7KB | ✅ 0 | 🟡 7 |
| quiz-mmpc01.html | 417 | 17.6KB | ✅ 0 | ✅ 0 |
| quiz-mmpc02.html | 96 | 20.9KB | ✅ 0 | ✅ 0 |
| quiz-mmpc03.html | 82 | 18.1KB | ✅ 0 | ✅ 0 |
| quiz-mmpc04.html | 82 | 19.0KB | ✅ 0 | ✅ 0 |
| quiz-mmpc05.html | 82 | 18.3KB | ✅ 0 | ✅ 0 |
| quiz-mmpc06.html | 82 | 19.7KB | ✅ 0 | ✅ 0 |
| quiz-mmpc07.html | 82 | 19.7KB | ✅ 0 | ✅ 0 |
| flashcards.html | 152 | 5.3KB | ✅ 0 | ✅ 0 |
| quiz-results.html | 369 | 19.8KB | ✅ 0 | ✅ 0 |

**Total Bugs: 0 | Total Warnings: 9**

---

## study-mmpc06.html

### 🟡 Warnings

- EMPTY_ELEMENTS: 1 non-intentional empty elements
-   → Line 465: <div  class="reading-progress">

### ℹ️ Info

- VIDEO: 14 toggle btns, 0 placeholders, 24 YT iframes, 12 inline toggles, lazy-load JS: true
- ACTION_BAR: 12 action-bar elements
- NAV: 0 sidebar nav links
- CONTENT: 0 section-cards, 0 chapter-cards, 0 unit-cards
- STRUCTURE: 0 <section> elements

---

## study-mmpc07.html

### 🟡 Warnings

- EMPTY_ELEMENTS: 49 non-intentional empty elements
-   → Line 213: <div  class="reading-progress">
-   → Line 252: <div  class="video-placeholder" data-src="https://www.youtube-noc>
-   → Line 253: <div  class="video-placeholder" data-src="https://www.youtube-noc>
-   → Line 254: <div  class="video-placeholder" data-src="https://www.youtube-noc>
-   → Line 255: <div  class="video-placeholder" data-src="https://www.youtube-noc>
-   → ...and 44 more

### ℹ️ Info

- VIDEO: 17 toggle btns, 52 placeholders, 48 YT iframes, 15 inline toggles, lazy-load JS: true
- ACTION_BAR: 15 action-bar elements
- NAV: 0 sidebar nav links
- CONTENT: 0 section-cards, 0 chapter-cards, 0 unit-cards
- STRUCTURE: 0 <section> elements

---

## quiz-mmpc01.html

✅ **No bugs or warnings found.**

---

## quiz-mmpc02.html

✅ **No bugs or warnings found.**

---

## quiz-mmpc03.html

✅ **No bugs or warnings found.**

---

## quiz-mmpc04.html

✅ **No bugs or warnings found.**

---

## quiz-mmpc05.html

✅ **No bugs or warnings found.**

---

## quiz-mmpc06.html

✅ **No bugs or warnings found.**

---

## quiz-mmpc07.html

✅ **No bugs or warnings found.**

---

## flashcards.html

✅ **No bugs or warnings found.**

---

## quiz-results.html

✅ **No bugs or warnings found.**

---

## Cross-File Analysis

### Quiz File Patterns

- **quiz-mmpc01.html**: 417 lines, 0 bugs, 0 warnings
- **quiz-mmpc02.html**: 96 lines, 0 bugs, 0 warnings
- **quiz-mmpc03.html**: 82 lines, 0 bugs, 0 warnings
- **quiz-mmpc04.html**: 82 lines, 0 bugs, 0 warnings
- **quiz-mmpc05.html**: 82 lines, 0 bugs, 0 warnings
- **quiz-mmpc06.html**: 82 lines, 0 bugs, 0 warnings
- **quiz-mmpc07.html**: 82 lines, 0 bugs, 0 warnings

### External JS Dependencies

- api-utils.js: ✅ exists
- pomodoro.js: ✅ exists
- bookmark-notes.js: ✅ exists
- flashcards.js: ✅ exists

**toggleMobileSidebar defined in api-utils.js:** ✅ Yes

---

## Methodology

1. **Duplicate consecutive lines** — Exact match of trimmed lines >20 chars
2. **Flowchart duplicate IDs** — `id="fc-s-*"` or `id="fc-a-*"` appearing more than once
3. **Div tag balance** — Count `<div>` vs `</div>`
4. **Empty elements** — Tags with no content (excluding known JS-populated containers by ID)
5. **Video toggles** — Verify toggle buttons have working onclick handlers and video sources exist
6. **Blue/purple colors** — Search for #5e8cf0, #a78bfa, #667eea, #7b6cf0, #f472b6, #3b6fcf, #7ba4f7
7. **Viewport meta** — Check for `<meta name="viewport">`
8. **Action bar vs unit** — Compare action-bar element count with section/unit content blocks
9. **Script tag balance** — `<script>` vs `</script>`
10. **Root tag balance** — `<html>`, `<head>`, `<body>` open vs close
