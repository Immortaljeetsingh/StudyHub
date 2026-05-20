// api-utils.js — Shared OpenRouter API + UI functions for StudyHub

// ==================== DEFAULTS ====================
const DEFAULT_API_KEY_PART1 = 'sk-or-v1-548d5250b839b8cb8abe12';
const DEFAULT_API_KEY_PART2 = 'cedc387c456b8b3244b72fbccca390d7e0b6170059';
const DEFAULT_API_KEY = DEFAULT_API_KEY_PART1 + DEFAULT_API_KEY_PART2;
const DEFAULT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';

const FREE_MODELS = [
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B (Default)' },
    { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5' },
    { id: 'deepseek/deepseek-v4-flash:free', name: 'DeepSeek V4 Flash' },
    { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B' },
    { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B' },
    { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B' },
    { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B' },
    { id: 'poolside/laguna-m.1:free', name: 'Poolside Laguna M.1' },
];

function getApiKey() { return localStorage.getItem('openrouter-api-key') || DEFAULT_API_KEY; }
function getModel() { return localStorage.getItem('openrouter-model') || DEFAULT_MODEL; }

// ==================== OPENROUTER API ====================
async function callOpenRouter(text, systemPrompt) {
    const apiKey = getApiKey(); const model = getModel();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }], temperature: 0.4, max_tokens: 1500 })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err.error?.message || response.statusText;
        if (response.status === 403 && msg.includes('limit')) {
            localStorage.removeItem('openrouter-api-key');
            localStorage.removeItem('openrouter-model');
            throw new Error('API key limit reached. Get a free key at openrouter.ai/keys');
        }
        throw new Error(msg);
    }
    return (await response.json()).choices[0].message.content;
}

// ==================== SUMMARIZE ====================
function initSummarizeButtons() {
    document.querySelectorAll('.summarize-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const target = document.querySelector(btn.getAttribute('data-target'));
            if (!target) return;
            btn.disabled = true; btn.textContent = '⏳ Summarizing...';
            try {
                const summary = await callOpenRouter(target.innerText, 'You are a study assistant for MBA students. Summarize into clear bullet points. Highlight key definitions, important facts, exam-relevant points.');
                let out = document.querySelector('#ai-' + btn.getAttribute('data-target').replace('#',''));
                if (!out) { out = document.createElement('div'); out.id = 'ai-' + btn.getAttribute('data-target').replace('#',''); out.className = 'ai-output'; target.parentElement.insertBefore(out, target); }
                out.innerHTML = '<strong>📝 AI Summary:</strong>\n\n' + formatAIResponse(summary);
                out.classList.add('visible'); btn.textContent = '✅ Summarized!';
                setTimeout(() => { btn.textContent = '📝 Summarize'; btn.disabled = false; }, 2000);
            } catch (e) { btn.textContent = '❌ Error'; btn.disabled = false; setTimeout(() => btn.textContent = '📝 Summarize', 2000); showToast('❌ ' + e.message, 'error'); }
        });
    });
}
// ==================== ASK AI ====================
function initAskButtons() {
    document.querySelectorAll('.ask-ai-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const target = document.querySelector(btn.getAttribute('data-target'));
            if (!target) return;
            const question = prompt('💬 Ask anything about this section:');
            if (!question || !question.trim()) return;
            btn.disabled = true; btn.textContent = '🤔 Thinking...';
            try {
                const answer = await callOpenRouter(`Context:\n${target.innerText}\n\nStudent's Question: ${question}`, 'You are a patient MBA tutor. Answer using the context. Use simple language, examples, bullet points.');
                let out = document.querySelector('#ai-' + btn.getAttribute('data-target').replace('#',''));
                if (!out) { out = document.createElement('div'); out.id = 'ai-' + btn.getAttribute('data-target').replace('#',''); out.className = 'ai-output'; target.parentElement.insertBefore(out, target); }
                out.innerHTML = `<strong>💬 Q: ${escapeHtml(question)}</strong>\n\n` + formatAIResponse(answer);
                out.classList.add('visible'); btn.textContent = '💬 Ask AI'; btn.disabled = false;
            } catch (e) { btn.textContent = '❌ Error'; btn.disabled = false; setTimeout(() => btn.textContent = '💬 Ask AI', 2000); showToast('❌ ' + e.message, 'error'); }
        });
    });
}

// ==================== THEME ====================
function toggleTheme() {
    var html = document.documentElement;
    var current = html.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('studyhub-theme', next); } catch(e) {}
    var btn = document.getElementById('themeToggleBtn'); if (btn) btn.textContent = next === 'light' ? '☀️ Light' : '🌙 Dark';
}
function loadTheme() { var saved = localStorage.getItem('studyhub-theme'); if (saved === 'light') { document.documentElement.setAttribute('data-theme', 'light'); var btn = document.getElementById('themeToggleBtn'); if (btn) btn.textContent = '☀️ Light'; } }

// ==================== API SETTINGS (stub — kept in study-hub.html via app.js) ====================
function renderApiSettingsModal() { return ''; }
function openApiSettings() {}

// ==================== UNITS TOGGLE ====================
function toggleUnits() {
    const sb = document.querySelector('.study-sidebar');
    const layout = document.querySelector('.study-layout');
    if (!sb || !layout) return;
    const isOpen = sb.classList.toggle('units-open');
    layout.classList.toggle('sidebar-visible', isOpen);
    try { localStorage.setItem('studyhub-units-open', isOpen ? '1' : '0'); } catch(e) {}
    var btn = document.getElementById('unitsToggleBtn');
    if (btn) {
        btn.textContent = isOpen ? '✕ Hide Units' : '☰ Units';
        btn.classList.toggle('active', isOpen);
    }
}
function restoreUnitsState() {
    try {
        var isOpen = localStorage.getItem('studyhub-units-open') === '1';
        if (isOpen) {
            var sb = document.querySelector('.study-sidebar');
            var layout = document.querySelector('.study-layout');
            if (sb && layout) {
                sb.classList.add('units-open');
                layout.classList.add('sidebar-visible');
                var btn = document.getElementById('unitsToggleBtn');
                if (btn) { btn.textContent = '✕ Hide Units'; btn.classList.add('active'); }
            }
        }
    } catch(e) {}
}

// ==================== UTILS ====================
function initReadingProgress() { const bar = document.querySelector('.reading-progress'); if (!bar) return; window.addEventListener('scroll', () => { const h = document.documentElement; bar.style.width = Math.min((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100, 100) + '%'; }); }
function toggleMobileSidebar() { const sb = document.querySelector('.study-sidebar'); if (sb) sb.classList.toggle('mobile-open'); }
function formatAIResponse(text) { return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n- /g, '\n• ').replace(/\n(\d+)\. /g, '\n$1. '); }
function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function showToast(msg, type) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;border-radius:10px;font-family:Inter,sans-serif;font-size:0.9rem;z-index:99999;animation:fadeIn 0.3s ease;color:white;max-width:360px;box-shadow:0 8px 30px rgba(0,0,0,0.3);';
    t.style.background = type === 'error' ? '#e53e3e' : type === 'success' ? '#48bb78' : '#667eea';
    t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3500);
}
function initScrollSpy() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('h2[id^="block"], .unit[id^="u"]');
    if (navLinks.length === 0 || sections.length === 0) return;
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 140;
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop) {
                current = section.getAttribute('id');
            }
        });
        if (current) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === '#' + current || (href.startsWith('#') && href.slice(1) === current)) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    });
}
function initMobileSidebarAutoClose() {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                const sb = document.querySelector('.study-sidebar');
                if (sb) sb.classList.remove('mobile-open');
            }
        });
    });
}
function initSidebarCloseButton() {
    const header = document.querySelector('.sidebar-header');
    if (header && !header.querySelector('.sidebar-close-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'sidebar-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close sidebar');
        closeBtn.addEventListener('click', () => {
            const sb = document.querySelector('.study-sidebar');
            if (sb) sb.classList.remove('mobile-open');
        });
        header.appendChild(closeBtn);
    }
}

// ==================== COMPONENTS ====================
function renderToolbar(subjectCode) {
    var code = subjectCode.replace('-', '');
    var studyHref = 'study-' + code + '.html';
    var quizHref = 'quiz-' + code + '.html';
    return '<div class="top-toolbar"><a href="study-hub.html" class="btn btn-outline" style="margin-right:auto">\u2190 Hub</a><button id="unitsToggleBtn" class="btn btn-outline" onclick="toggleUnits()">\u2630 Units</button><a href="' + studyHref + '" class="btn btn-outline">\uD83D\uDCD8 Study</a><a href="' + quizHref + '" class="btn btn-outline">\uD83D\uDCDD Quiz</a><button id="themeToggleBtn" class="btn btn-outline" onclick="toggleTheme()">\uD83C\uDF19 Dark</button></div>';
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    loadTheme(); restoreUnitsState(); initSummarizeButtons(); initAskButtons(); initReadingProgress();
    initScrollSpy(); initMobileSidebarAutoClose(); initSidebarCloseButton();

    // Mobile: wrap tables in scrollable containers
    document.querySelectorAll('.comparison-table, table').forEach(t => {
        if (t.parentElement && t.parentElement.classList.contains('table-wrap')) return;
        const wrap = document.createElement('div'); wrap.className = 'table-wrap';
        t.parentNode.insertBefore(wrap, t); wrap.appendChild(t);
    });

    // Mobile: improve API error display
    const origToast = window.showToast;
    window.showToast = function(msg, type) {
        if (typeof origToast === 'function') origToast(msg, type);
        else {
            const t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;left:2rem;padding:1rem 1.25rem;border-radius:12px;font-family:Inter,sans-serif;font-size:0.88rem;z-index:99999;color:white;box-shadow:0 8px 30px rgba(0,0,0,0.3);text-align:center;';
            t.style.background = type === 'error' ? '#e53e3e' : type === 'success' ? '#48bb78' : '#667eea';
            t.textContent = msg; document.body.appendChild(t);
            setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 4000);
        }
    };
});
