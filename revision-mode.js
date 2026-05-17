/* ============================
   StudyHub - Revision Mode & Notes
   ============================ */

(function () {
  'use strict';

  // ---- helpers ----
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function getSubjectName() {
    const h1 = $('h1, .page-title, .subject-title, header h1, header h2');
    if (h1) return h1.textContent.trim();
    // fallback: first breadcrumb segment or document title
    const crumb = $('.breadcrumb a, .breadcrumb li');
    return crumb ? crumb.textContent.trim() : document.title.replace(/\s*[-|].*$/, '').trim();
  }

  function getUnitId() {
    // Try common patterns: data-unit, page slug, or hash
    const body = $('body');
    if (body?.dataset.unit) return body.dataset.unit;
    const path = location.pathname;
    const slug = path.replace(/\/$/, '').split('/').pop();
    if (slug && slug !== 'index.html' && slug !== '') return slug;
    // fallback: subject + h2/h3
    const h2 = $('h2');
    return (getSubjectName() + '-' + (h2 ? h2.textContent.trim() : 'page')).replace(/\s+/g, '-').toLowerCase();
  }

  // ===================================================================
  //  1.  EXAM REVISION MODE
  // ===================================================================

  let revisionActive = false;
  const REVISION_KEY = 'studyhub-revision-mode';

  function createRevisionFab() {
    const btn = document.createElement('button');
    btn.className = 'exam-mode-fab';
    btn.textContent = '📝 Exam Mode';
    btn.addEventListener('click', toggleRevision);
    document.body.appendChild(btn);
    return btn;
  }

  function createRevisionHeader() {
    const studyContent = $('.study-content');
    if (!studyContent || $('.revision-header', studyContent)) return;

    const header = document.createElement('div');
    header.className = 'revision-header';
    header.innerHTML = `
      <h2>📝 Quick Revision — ${getSubjectName()}</h2>
      <button class="revision-exit-btn" onclick="document.dispatchEvent(new Event('revision-exit'))">✕ Exit Revision</button>
    `;
    studyContent.prepend(header);
  }

  function toggleRevision() {
    revisionActive = !revisionActive;
    document.body.classList.toggle('revision-mode', revisionActive);

    const fab = $('.exam-mode-fab');
    if (fab) {
      fab.classList.toggle('active', revisionActive);
      fab.textContent = revisionActive ? '✅ Exit Exam Mode' : '📝 Exam Mode';
    }

    if (revisionActive) {
      createRevisionHeader();
    }

    try { localStorage.setItem(REVISION_KEY, revisionActive ? '1' : '0'); } catch (e) { /* */ }
  }

  function restoreRevision() {
    if (localStorage.getItem(REVISION_KEY) === '1') {
      revisionActive = true;
      document.body.classList.add('revision-mode');
      createRevisionHeader();
      // Update fab after it's created
      requestAnimationFrame(() => {
        const fab = $('.exam-mode-fab');
        if (fab) {
          fab.classList.add('active');
          fab.textContent = '✅ Exit Exam Mode';
        }
      });
    }
  }

  // Listen for exit via header button
  document.addEventListener('revision-exit', () => {
    if (revisionActive) toggleRevision();
  });

  // ===================================================================
  //  2.  UNIT NOTES
  // ===================================================================

  const NOTES_PREFIX = 'studyhub-notes-';
  let currentNotesUnitId = null;

  function notesKey(unitId) {
    return NOTES_PREFIX + unitId;
  }

  function getNotes(unitId) {
    try { return localStorage.getItem(notesKey(unitId)) || ''; } catch (e) { return ''; }
  }

  function saveNotes(unitId, text) {
    try {
      if (text.trim()) {
        localStorage.setItem(notesKey(unitId), text);
      } else {
        localStorage.removeItem(notesKey(unitId));
      }
    } catch (e) { /* */ }
  }

  // -- Notes Overlay (singleton) --
  let overlay = null;
  let textarea = null;
  let toastEl = null;

  function ensureOverlay() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'notes-overlay';
    overlay.innerHTML = `
      <div class="notes-panel">
        <div class="notes-panel-header">
          <h3>📝 Unit Notes</h3>
          <button class="notes-panel-close" aria-label="Close">&times;</button>
        </div>
        <textarea class="notes-textarea" placeholder="Type your notes here…"></textarea>
        <div class="notes-panel-footer">
          <button class="notes-delete-btn">🗑 Delete</button>
          <button class="notes-save-btn">💾 Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    textarea = overlay.querySelector('.notes-textarea');

    // Close
    overlay.querySelector('.notes-panel-close').addEventListener('click', closeNotes);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeNotes(); });

    // Save
    overlay.querySelector('.notes-save-btn').addEventListener('click', () => {
      if (currentNotesUnitId) {
        saveNotes(currentNotesUnitId, textarea.value);
        refreshNotesIndicators();
        showToast('Notes saved ✓');
      }
    });

    // Delete
    overlay.querySelector('.notes-delete-btn').addEventListener('click', () => {
      if (currentNotesUnitId) {
        textarea.value = '';
        saveNotes(currentNotesUnitId, '');
        refreshNotesIndicators();
        showToast('Notes deleted');
      }
    });

    // Auto-save on close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeNotes();
    });

    // Toast
    toastEl = document.createElement('div');
    toastEl.className = 'notes-saved-toast';
    document.body.appendChild(toastEl);
  }

  function openNotes(unitId) {
    ensureOverlay();
    currentNotesUnitId = unitId;
    textarea.value = getNotes(unitId);
    overlay.classList.add('open');
    requestAnimationFrame(() => textarea.focus());
  }

  function closeNotes() {
    // Auto-save
    if (currentNotesUnitId && textarea) {
      saveNotes(currentNotesUnitId, textarea.value);
      refreshNotesIndicators();
    }
    overlay?.classList.remove('open');
    currentNotesUnitId = null;
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // -- Inject Notes Buttons into action-bars --
  function injectNotesButtons() {
    const actionBars = $$('.action-bar');
    actionBars.forEach((bar) => {
      if (bar.querySelector('.notes-btn')) return; // already injected

      // Derive unit id from nearest section / heading / data attr
      const section = bar.closest('[data-unit]') || bar.closest('section') || bar.closest('.unit');
      let unitId = section?.dataset?.unit;
      if (!unitId) {
        const heading = section ? $('h2, h3', section) : null;
        unitId = heading
          ? heading.textContent.trim().replace(/\s+/g, '-').toLowerCase()
          : getUnitId();
      }

      const btn = document.createElement('button');
      btn.className = 'notes-btn';
      btn.dataset.unitId = unitId;
      btn.innerHTML = '📝 Notes <span class="notes-dot"></span>';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openNotes(unitId);
      });
      bar.appendChild(btn);
    });

    refreshNotesIndicators();
  }

  function refreshNotesIndicators() {
    $$('.notes-btn').forEach((btn) => {
      const uid = btn.dataset.unitId;
      btn.classList.toggle('has-notes', !!getNotes(uid));
    });
  }

  // ===================================================================
  //  INIT
  // ===================================================================

  function init() {
    createRevisionFab();
    restoreRevision();
    injectNotesButtons();

    // Re-inject if DOM changes (SPA nav)
    const observer = new MutationObserver(() => {
      injectNotesButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
