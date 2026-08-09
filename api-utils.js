// api-utils.js — Shared OpenRouter API + UI functions for StudyHub

// ==================== DEFAULTS ====================
const DEFAULT_MODEL = 'google/gemma-4-31b-it:free';
let DEFAULT_API_KEY = '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';

const FREE_MODELS = [
    { id: 'openrouter/free', name: 'Auto (Best Free Model)' },
    { id: 'openai/gpt-oss-20b:free', name: 'OpenAI gpt-oss-20b' },
    { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google Gemma 4 26B' },
    { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B' },
    { id: 'inclusionai/ling-3.0-tiny:free', name: 'inclusionAI Ling 3.0 Tiny' },
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'NVIDIA Nemotron 3 Nano 30B' },
    { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', name: 'NVIDIA Nemotron 3 Nano Omni (Reasoning)' },
    { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'NVIDIA Nemotron 3 Super 120B' },
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'NVIDIA Nemotron 3 Ultra 550B' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'NVIDIA Nemotron Nano 12B 2 VL' },
    { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'NVIDIA Nemotron Nano 9B V2' },
    { id: 'cohere/north-mini-code:free', name: 'Cohere North Mini Code' },
    { id: 'poolside/laguna-s-2.1:free', name: 'Poolside Laguna S 2.1' },
    { id: 'poolside/laguna-xs-2.1:free', name: 'Poolside Laguna XS 2.1' },
];

function getApiKey() { try { return localStorage.getItem('studyhub-api-key') || localStorage.getItem('openrouter-api-key') || DEFAULT_API_KEY; } catch(e) { return DEFAULT_API_KEY; } }
function getModel() { try { return localStorage.getItem('studyhub-model') || localStorage.getItem('openrouter-model') || DEFAULT_MODEL; } catch(e) { return DEFAULT_MODEL; } }

// ==================== OPENROUTER API ====================
async function callOpenRouter(text, systemPrompt) {
    const apiKey = getApiKey(); const model = getModel();
    if (!apiKey) throw new Error('Set your API key first — use API settings on the Study Hub (openrouter.ai/keys)');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }], temperature: 0.4, max_tokens: 1500 })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err.error?.message || response.statusText;
        if (response.status === 403 && msg.includes('limit')) {
            try { localStorage.removeItem('studyhub-api-key'); localStorage.removeItem('openrouter-api-key'); localStorage.removeItem('studyhub-model'); localStorage.removeItem('openrouter-model'); } catch(e) {}
            DEFAULT_API_KEY = '';
            throw new Error('API key rate-limited. Open API Settings (gear icon) to enter a new key — get one free at openrouter.ai/keys');
        }
        throw new Error(msg);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('Model "' + (data.model || model) + '" returned an empty response (openrouter/free can route to non-chat models). Open API Settings (gear icon) and pick a specific chat model.');
    }
    return content;
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

// ==================== API SETTINGS ====================
function renderApiSettingsModal() {
    return '<div id="apiSettingsModal" style="display:none;position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,0.6);align-items:center;justify-content:center" onclick="if(event.target===this)closeApiSettings()">'
        + '<div style="background:#fff;color:#1a1a2e;padding:1.5rem;border-radius:12px;width:min(420px,90vw);font-family:Inter,sans-serif">'
        + '<h3 style="margin:0 0 1rem;font-size:1.1rem">⚙ API Settings</h3>'
        + '<label style="display:block;font-size:0.8rem;margin-bottom:0.25rem">OpenRouter API Key <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" style="color:#667eea">(get one)</a></label>'
        + '<input id="apiKeyInput" type="password" placeholder="sk-or-v1-..." style="width:100%;padding:0.6rem;margin-bottom:0.75rem;border:1px solid #ddd;border-radius:8px;font-size:0.9rem;box-sizing:border-box">'
        + '<label style="display:block;font-size:0.8rem;margin-bottom:0.25rem">Model</label>'
        + '<select id="modelSelect" style="width:100%;padding:0.6rem;margin-bottom:1rem;border:1px solid #ddd;border-radius:8px;font-size:0.9rem;background:#fff">'
        + FREE_MODELS.map(m => '<option value="' + m.id + '">' + m.name + '</option>').join('')
        + '</select>'
        + '<div style="display:flex;gap:0.5rem;justify-content:flex-end">'
        + '<button onclick="closeApiSettings()" style="padding:0.5rem 1rem;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer">Cancel</button>'
        + '<button onclick="saveApiSettings()" style="padding:0.5rem 1rem;border:none;border-radius:8px;background:#667eea;color:#fff;cursor:pointer">Save</button>'
        + '</div></div></div>';
}
function openApiSettings() {
    const m = document.getElementById('apiSettingsModal');
    if (!m) return;
    const key = document.getElementById('apiKeyInput'), model = document.getElementById('modelSelect');
    if (key) key.value = getApiKey();
    if (model) model.value = getModel();
    m.style.display = 'flex';
}
function closeApiSettings() { const m = document.getElementById('apiSettingsModal'); if (m) m.style.display = 'none'; }
function saveApiSettings() {
    try {
        const key = document.getElementById('apiKeyInput'), model = document.getElementById('modelSelect');
        if (key) localStorage.setItem('studyhub-api-key', key.value.trim());
        if (model) localStorage.setItem('studyhub-model', model.value);
        closeApiSettings();
        showToast('✅ API settings saved', 'success');
    } catch(e) { showToast('❌ Could not save settings', 'error'); }
}

// ==================== UNITS TOGGLE ====================
function toggleUnits() {
    const sb = document.querySelector('.study-sidebar');
    const layout = document.querySelector('.study-layout');
    if (!sb || !layout) return;
    if (window.innerWidth <= 900) { sb.classList.toggle('mobile-open'); return; }
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
        if (isOpen && window.innerWidth > 900) {
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
function formatAIResponse(text) { if (!text) return ''; return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n- /g, '\n• ').replace(/\n(\d+)\. /g, '\n$1. '); }
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
                if (sb) {
                    sb.classList.remove('mobile-open');
                    sb.classList.remove('units-open');
                }
                const layout = document.querySelector('.study-layout');
                if (layout) layout.classList.remove('sidebar-visible');
                const btn = document.getElementById('unitsToggleBtn');
                if (btn) { btn.textContent = '☰ Units'; btn.classList.remove('active'); }
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
            if (sb) {
                sb.classList.remove('mobile-open');
                sb.classList.remove('units-open');
            }
            const layout = document.querySelector('.study-layout');
            if (layout) layout.classList.remove('sidebar-visible');
            const btn = document.getElementById('unitsToggleBtn');
            if (btn) { btn.textContent = '☰ Units'; btn.classList.remove('active'); }
        });
        header.appendChild(closeBtn);
    }
}

// ==================== COMPONENTS ====================
function renderToolbar(subjectCode) {
    var code = subjectCode.toLowerCase().replace('-', '');
    var studyHref = 'study-' + code + '.html';
    var quizHref = 'quiz-' + code + '.html';
    return '<div class="top-toolbar"><a href="study-hub.html" class="btn btn-outline">\u2190 Hub</a><button id="unitsToggleBtn" class="btn btn-outline" onclick="toggleUnits()">\u2630 Units</button><a href="' + studyHref + '" class="btn btn-outline">\uD83D\uDCD8 Study</a><a href="' + quizHref + '" class="btn btn-outline">\uD83D\uDCDD Quiz</a><button id="themeToggleBtn" class="btn btn-outline" onclick="toggleTheme()">\uD83C\uDF19 Dark</button><button class="btn btn-outline" onclick="openApiSettings()" title="API Settings">\u2699\uFE0F API</button></div>';
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
});
