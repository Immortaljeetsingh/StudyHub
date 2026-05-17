/**
 * StudyHub Search & Filter System
 * Provides global search across all subjects and content
 */

(function() {
    'use strict';

    // Search index - will be populated from each study page
    let searchIndex = [];
    let searchResults = [];
    let currentSearchTerm = '';

    // Initialize search when DOM is ready
    function initSearch() {
        const searchInput = document.getElementById('globalSearch');
        const searchResults = document.getElementById('searchResults');
        const searchClear = document.getElementById('searchClear');

        if (!searchInput) return;

        // Build search index from course data
        buildSearchIndex();

        // Real-time search on input
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });

        // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
            // Escape to close search results
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                clearSearch();
                searchInput.blur();
            }
        });

        // Clear search button
        if (searchClear) {
            searchClear.addEventListener('click', clearSearch);
        }

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer && !searchContainer.contains(e.target)) {
                hideSearchResults();
            }
        });
    }

    // Build searchable index from all courses
    function buildSearchIndex() {
        const courses = [
            {
                id: 'mmpc-01',
                title: 'MMPC-01: Management Functions & Organizational Processes',
                description: 'Management principles, planning, organizing, staffing, directing, controlling',
                href: 'study-mmpc01.html',
                keywords: ['management', 'planning', 'organizing', 'staffing', 'directing', 'controlling', 'taylor', 'fayol', 'maslow', 'herzberg']
            },
            {
                id: 'mmpc-02',
                title: 'MMPC-02: Human Resource Management',
                description: 'HRM functions, recruitment, selection, training, performance appraisal, compensation',
                href: 'study-mmpc02.html',
                keywords: ['hr', 'human resource', 'recruitment', 'selection', 'training', 'appraisal', 'compensation', 'hiring']
            },
            {
                id: 'mmpc-03',
                title: 'MMPC-03: Business Environment',
                description: 'Economic environment, political environment, legal environment, social environment',
                href: 'study-mmpc03.html',
                keywords: ['business environment', 'economic', 'political', 'legal', 'social', 'pestel', 'swot']
            },
            {
                id: 'mmpc-04',
                title: 'MMPC-04: Accounting and Finance for Managers',
                description: 'Financial statements, ratio analysis, budgeting, working capital, investment decisions',
                href: 'study-mmpc04.html',
                keywords: ['accounting', 'finance', 'balance sheet', 'income statement', 'cash flow', 'ratio', 'budget', 'npv', 'irr']
            },
            {
                id: 'mmpc-05',
                title: 'MMPC-05: Quantitative Analysis for Managerial Applications',
                description: 'Statistics, probability, hypothesis testing, correlation, regression, forecasting',
                href: 'study-mmpc05.html',
                keywords: ['statistics', 'probability', 'hypothesis', 'correlation', 'regression', 'forecasting', 'anova', 'chi-square']
            },
            {
                id: 'mmpc-06',
                title: 'MMPC-06: Marketing Management',
                description: 'Marketing mix, segmentation, targeting, positioning, product life cycle, branding',
                href: 'study-mmpc06.html',
                keywords: ['marketing', 'segmentation', 'targeting', 'positioning', '4p', 'product', 'price', 'place', 'promotion', 'branding']
            },
            {
                id: 'mmpc-07',
                title: 'MMPC-07: Business Communication',
                description: 'Communication process, barriers, oral communication, written communication, non-verbal',
                href: 'study-mmpc07.html',
                keywords: ['communication', 'oral', 'written', 'non-verbal', 'barriers', 'listening', 'presentation', 'report', 'email']
            }
        ];

        searchIndex = courses.map(course => ({
            ...course,
            searchText: `${course.title} ${course.description} ${course.keywords.join(' ')}`.toLowerCase()
        }));
    }

    // Perform search
    function performSearch(term) {
        currentSearchTerm = term.trim();
        const resultsContainer = document.getElementById('searchResults');
        
        if (!currentSearchTerm) {
            hideSearchResults();
            return;
        }

        // Filter index based on search term
        searchResults = searchIndex.filter(item => 
            item.searchText.includes(currentSearchTerm.toLowerCase())
        );

        // Display results
        displaySearchResults(searchResults);
    }

    // Display search results
    function displaySearchResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <span class="search-no-results-icon">🔍</span>
                    <p>No results found for "${escapeHtml(currentSearchTerm)}"</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = results.map(item => `
                <a href="${item.href}" class="search-result-item">
                    <div class="search-result-title">${highlightMatch(item.title, currentSearchTerm)}</div>
                    <div class="search-result-desc">${highlightMatch(item.description, currentSearchTerm)}</div>
                    <div class="search-result-badge">${item.id.toUpperCase()}</div>
                </a>
            `).join('');
        }

        resultsContainer.style.display = 'block';
        resultsContainer.setAttribute('aria-expanded', 'true');
    }

    // Highlight matching text
    function highlightMatch(text, term) {
        if (!term) return escapeHtml(text);
        const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
        return escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    // Hide search results
    function hideSearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
            resultsContainer.setAttribute('aria-expanded', 'false');
        }
    }

    // Clear search
    function clearSearch() {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        hideSearchResults();
        currentSearchTerm = '';
    }

    // Utility: Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility: Escape regex special characters
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearch);
    } else {
        initSearch();
    }

    // Expose functions globally
    window.StudyHubSearch = {
        performSearch,
        clearSearch,
        buildSearchIndex
    };
})();
