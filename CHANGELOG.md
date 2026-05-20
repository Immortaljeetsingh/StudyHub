# StudyHub Refactor — Changelog

## A. Theme System
- Replaced `body.light-theme` class with `data-theme` attribute on `<html>`
- Created CSS custom property design system with 20+ tokens (--bg-primary, --bg-surface, --bg-elevated, --text-primary, --text-secondary, --text-muted, --accent, --border, --shadow, etc.)
- Dark theme is default (matches navy header)
- Toggle button label shows TARGET theme, not current
- Theme persists in `localStorage` key `studyhub-theme`
- Replaced all hardcoded `rgba(0,0,0,X)` and `rgba(255,255,255,X)` with token references
- Removed 150+ `!important` declarations from light theme overrides

## B. Color Palette
- Primary: deep indigo `#5b6cff` (replaces gray `#c8c8c8`)
- Secondary: violet `#a855f7` (replaces gray `#b0b0b0`)
- Accent warm: amber `#f59e0b` (replaces gray `#d0d0d0`)
- Success: emerald `#10b981`
- Danger: rose `#ef4444`
- Hero title gradient: `#5b6cff → #a855f7 → #f59e0b`
- Course node colors preserved as-is
- Removed all gray-on-gray gradient backgrounds

## C. HTML Structure
- Removed orphan `legend-item` divs from `#graph-container`
- Wrapped legend in proper `<div class="graph-legend">` with flex layout
- Added `.search-box` base styling (not just `:focus-within`)
- Added skeleton loaders for `#subjects` and `#dashboardStats`
- Visitor counter via Firebase (preserved existing implementation)
- Added skip-link: `<a href="#main" class="skip-link">Skip to content</a>`
- Wrapped header action buttons in `.header-actions` flex container

## D. Accessibility
- Added `aria-label` to all icon-only buttons (FAB, mobile-nav-toggle, theme toggle, search-clear)
- Implemented keyboard handlers: `T` toggles theme, `?` opens shortcuts modal, `Ctrl+K`/`Cmd+K` focuses search, `Esc` closes modals/FAB
- Tooltip system uses `visibility:hidden → visible` + `opacity` (not `display:none`) for CSS transitions
- Added `prefers-reduced-motion: reduce` media query disabling ambientDrift, gradientFlow, progressShimmer, transform hovers
- All focusable elements have visible `:focus-visible` outline: 2px solid `var(--accent)` with offset
- Added `role="dialog"` and `aria-modal` to API settings modal
- Added `aria-expanded` to mobile sidebar toggle

## E. Performance
- Consolidated 8 CSS files into single `styles.css`
- Removed duplicate CSS rules across files
- Moved `<script>` to end of `<body>` with `defer`
- Removed `Cache-Control: no-cache` meta tags (GitHub Pages handles caching)
- `body::before` animation paused via `prefers-reduced-motion`
- Removed runtime `<style>` injection in `toggleFocusMode()` — rules defined in stylesheet
- Extracted inline JS into separate `app.js`

## F. Layout
- Hero: fluid title sizing with `clamp(2rem, 5vw + 1rem, 3.5rem)`
- Subjects grid: `grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr))`, container capped at 1280px
- Header: `.header-actions` flex container with `gap: 0.5rem` and proper wrap
- Toast repositioned to avoid FAB/mobile-nav overlap on mobile
- Hero padding: `clamp(3rem, 8vw, 6rem)` for fluid vertical spacing
- Added tablet breakpoint at 1024px

## G. JavaScript
- Implemented `renderSubjects()` — dynamic course card grid rendering
- Implemented `renderDashboardStats()` — circular progress ring stat cards
- Implemented `wireSearch()` — debounced (200ms) search across `courses[].name` and `courses[].desc`
- Implemented `wireKeyboardShortcuts()` — T, ?, Ctrl+K, Esc handlers
- Implemented `openApiSettings()`/`closeApiSettings()`/`saveApiKey()` modal handlers
- Daily visit tracker pushes ISO date strings to `studyhub-study-visits` array
- Visitor counter via Firebase Realtime Database (preserved)
- `console.warn` when localStorage is unavailable
- All functions extracted from inline `<script>` into `app.js`

## H. Responsive
- Added tablet breakpoint at 1024px
- Container queries for `.subject-card` where supported
- Testing targets: 320px, 375px, 768px, 1024px, 1440px
- Mobile header actions wrap properly
- Graph legend wraps on mobile

## I. SEO / PWA
- Added Open Graph meta tags (og:title, og:description, og:url, og:type)
- Added Twitter Card meta tags
- Added `<meta name="theme-color">` for dark and light variants
- Added favicon link
- Added JSON-LD schema for educational organization
- Service worker (`sw.js`) for offline-first caching
- Updated `manifest.json` with proper app metadata
