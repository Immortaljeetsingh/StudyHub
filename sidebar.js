/**
 * StudyHub Sidebar Navigation & UI Enhancements
 * Quick sidebar navigation, streak tracking, keyboard shortcuts
 */

(function() {
    'use strict';

    // ==================== SIDEBAR ====================
    function initSidebar() {
        const sidebar = document.getElementById('quickSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleBtn = document.getElementById('sidebarToggle');
        const closeBtn = document.getElementById('sidebarClose');

        if (!sidebar) return;

        // Toggle sidebar
        function openSidebar() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Focus first link for keyboard navigation
            const firstLink = sidebar.querySelector('.sidebar-link');
            if (firstLink) setTimeout(() => firstLink.focus(), 300);
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);

        // Keyboard: Ctrl+B to toggle sidebar, Escape to close
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                if (sidebar.classList.contains('active')) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            }
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                closeSidebar();
            }
        });

        // Update active link based on current page
        updateActiveLink();
        
        // Update progress bars in sidebar
        updateSidebarProgress();
    }

    function updateActiveLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const links = document.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || 
                (currentPage === '' && href === 'study-hub.html') ||
                (currentPage === 'study-hub.html' && href === 'study-hub.html')) {
                link.classList.add('active');
            }
        });
    }

    function updateSidebarProgress() {
        const progressBars = document.querySelectorAll('[data-progress-subject]');
        progressBars.forEach(bar => {
            const subject = bar.getAttribute('data-progress-subject');
            const progress = parseInt(localStorage.getItem(`studyhub-progress-${subject}`) || 0);
            const fill = bar.querySelector('.sidebar-progress-fill');
            if (fill) {
                fill.style.width = progress + '%';
            }
        });
    }

    // ==================== STREAK COUNTER ====================
    function initStreak() {
        updateStreakDisplay();
        trackVisit();
    }

    function trackVisit() {
        const today = new Date().toDateString();
        let visitHistory = [];
        try {
            visitHistory = JSON.parse(localStorage.getItem('studyhub-study-visits') || '[]');
        } catch (e) {
            visitHistory = [];
        }

        if (!visitHistory.includes(today)) {
            visitHistory.push(today);
            // Keep only last 30 days
            if (visitHistory.length > 30) {
                visitHistory = visitHistory.slice(-30);
            }
            localStorage.setItem('studyhub-study-visits', JSON.stringify(visitHistory));
        }
        
        updateStreakDisplay();
    }

    function updateStreakDisplay() {
        const streakEl = document.getElementById('streakDisplay');
        if (!streakEl) return;
        
        const streak = calculateStreak();
        streakEl.textContent = streak;
        
        // Add animation if streak > 0
        if (streak > 0) {
            streakEl.parentElement.classList.add('has-streak');
        }
    }

    function calculateStreak() {
        let visitHistory = [];
        try {
            visitHistory = JSON.parse(localStorage.getItem('studyhub-study-visits') || '[]');
        } catch (e) {
            return 0;
        }

        if (visitHistory.length === 0) return 0;

        const sorted = visitHistory
            .map(d => new Date(d))
            .sort((a, b) => b - a);

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            
            const found = sorted.some(d => {
                d.setHours(0, 0, 0, 0);
                return d.getTime() === checkDate.getTime();
            });

            if (found) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return streak;
    }

    // ==================== KEYBOARD SHORTCUTS MODAL ====================
    function initKeyboardShortcuts() {
        const modal = document.getElementById('shortcutsModal');
        if (!modal) return;

        // Show modal on ? key
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && 
                document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                openShortcutsModal();
            }
        });

        // Close modal
        const closeBtn = modal.querySelector('.shortcuts-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeShortcutsModal);
        }

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeShortcutsModal();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeShortcutsModal();
            }
        });
    }

    function openShortcutsModal() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeShortcutsModal() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ==================== INITIALIZE ALL ====================
    function init() {
        initSidebar();
        initStreak();
        initKeyboardShortcuts();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions
    window.StudyHubUI = {
        openShortcutsModal,
        closeShortcutsModal,
        calculateStreak
    };
})();
