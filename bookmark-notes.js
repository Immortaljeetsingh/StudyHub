/**
 * Bookmark & Notes System for StudyHub
 * Per-page bookmarks and notes with localStorage persistence
 */
(function() {
    'use strict';

    const BOOKMARKS_KEY = 'studyhub-bookmarks';
    const NOTES_KEY = 'studyhub-notes';

    // ==================== INIT ====================
    function init() {
        const currentPage = window.location.pathname.split('/').pop();
        const isStudyPage = currentPage.match(/^study-mmpc\d+\.html$/);
        
        if (isStudyPage) {
            addBookmarkButton();
            addNotesButton();
            loadNotes();
        }
        
        // Update sidebar bookmarks (runs on all pages)
        updateSidebarBookmarks();
    }

    // ==================== BOOKMARKS ====================
    function addBookmarkButton() {
        const btn = document.createElement('button');
        btn.className = 'bookmark-btn';
        btn.id = 'bookmarkBtn';
        btn.setAttribute('aria-label', 'Bookmark this page');
        btn.innerHTML = '☆';
        
        document.body.appendChild(btn);
        updateBookmarkState();
        
        btn.addEventListener('click', toggleBookmark);
    }

    function toggleBookmark() {
        const currentPage = window.location.pathname.split('/').pop();
        const title = document.title || currentPage;
        let bookmarks = getBookmarks();
        
        const existingIndex = bookmarks.findIndex(b => b.url === currentPage);
        
        if (existingIndex >= 0) {
            // Remove bookmark
            bookmarks.splice(existingIndex, 1);
        } else {
            // Add bookmark
            bookmarks.push({
                title: title,
                url: currentPage,
                timestamp: Date.now()
            });
        }
        
        saveBookmarks(bookmarks);
        updateBookmarkState();
        updateSidebarBookmarks();
    }

    function updateBookmarkState() {
        const btn = document.getElementById('bookmarkBtn');
        if (!btn) return;
        
        const currentPage = window.location.pathname.split('/').pop();
        const bookmarks = getBookmarks();
        const isBookmarked = bookmarks.some(b => b.url === currentPage);
        
        btn.innerHTML = isBookmarked ? '★' : '☆';
        btn.classList.toggle('bookmarked', isBookmarked);
        btn.setAttribute('aria-label', isBookmarked ? 'Remove bookmark' : 'Bookmark this page');
    }

    function getBookmarks() {
        try {
            return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveBookmarks(bookmarks) {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }

    function updateSidebarBookmarks() {
        const container = document.getElementById('sidebarBookmarks');
        if (!container) return;
        
        const bookmarks = getBookmarks();
        
        if (bookmarks.length === 0) {
            container.innerHTML = '<div style="padding: 0.5rem 0.75rem; color: var(--text-muted); font-size: 0.8rem;">No bookmarks yet</div>';
            return;
        }
        
        container.innerHTML = bookmarks.map((b, i) => `
            <div class="sidebar-bookmark-item">
                <span class="sidebar-bookmark-icon">🔖</span>
                <a href="${b.url}" style="flex: 1; color: inherit; text-decoration: none;">${b.title}</a>
                <button class="sidebar-bookmark-remove" onclick="event.preventDefault(); event.stopPropagation(); removeBookmark(${i});" aria-label="Remove bookmark">×</button>
            </div>
        `).join('');
    }

    window.removeBookmark = function(index) {
        const bookmarks = getBookmarks();
        bookmarks.splice(index, 1);
        saveBookmarks(bookmarks);
        updateSidebarBookmarks();
        updateBookmarkState();
    };

    // ==================== NOTES ====================
    function addNotesButton() {
        const btn = document.createElement('button');
        btn.className = 'notes-toggle';
        btn.id = 'notesBtn';
        btn.setAttribute('aria-label', 'Open notes panel');
        btn.innerHTML = '📝';
        btn.addEventListener('click', toggleNotesPanel);
        document.body.appendChild(btn);
    }

    function toggleNotesPanel() {
        let panel = document.getElementById('notesPanel');
        
        if (!panel) {
            panel = createNotesPanel();
            document.body.appendChild(panel);
        }
        
        panel.classList.toggle('active');
        
        if (panel.classList.contains('active')) {
            // Focus textarea
            const textarea = document.getElementById('notesTextarea');
            if (textarea) setTimeout(() => textarea.focus(), 300);
        }
    }

    function createNotesPanel() {
        const panel = document.createElement('div');
        panel.id = 'notesPanel';
        panel.className = 'notes-panel';
        
        const currentPage = window.location.pathname.split('/').pop();
        const pageTitle = document.title || currentPage;
        
        panel.innerHTML = `
            <div class="notes-header">
                <h3>📝 Notes: ${pageTitle}</h3>
                <button class="notes-close" id="notesClose" aria-label="Close notes">×</button>
            </div>
            <div class="notes-body">
                <textarea class="notes-textarea" id="notesTextarea" 
                          placeholder="Write your notes here..." 
                          aria-label="Notes for this page"></textarea>
            </div>
            <div class="notes-status" id="notesStatus">Last saved: Never</div>
        `;
        
        panel.querySelector('#notesClose').addEventListener('click', () => {
            panel.classList.remove('active');
        });
        
        const textarea = panel.querySelector('#notesTextarea');
        let saveTimeout;
        textarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => saveNotes(textarea.value), 500);
        });
        
        return panel;
    }

    function saveNotes(text) {
        const currentPage = window.location.pathname.split('/').pop();
        let notes = {};
        try {
            notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
        } catch (e) {
            notes = {};
        }
        
        if (text.trim()) {
            notes[currentPage] = {
                text: text,
                timestamp: Date.now()
            };
        } else {
            delete notes[currentPage];
        }
        
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
        
        // Update status
        const status = document.getElementById('notesStatus');
        if (status) {
            status.textContent = 'Last saved: Just now';
            status.classList.add('notes-saved');
            setTimeout(() => status.classList.remove('notes-saved'), 2000);
        }
    }

    function loadNotes() {
        const currentPage = window.location.pathname.split('/').pop();
        let notes = {};
        try {
            notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
        } catch (e) {
            return;
        }
        
        if (notes[currentPage]) {
            const textarea = document.getElementById('notesTextarea');
            if (textarea) {
                textarea.value = notes[currentPage].text;
            }
            
            const status = document.getElementById('notesStatus');
            if (status) {
                const savedTime = new Date(notes[currentPage].timestamp);
                status.textContent = `Last saved: ${savedTime.toLocaleTimeString()}`;
            }
        }
    }

    // ==================== RUN ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for sidebar integration
    window.StudyHubBookmarks = {
        getBookmarks,
        updateSidebarBookmarks
    };
})();
