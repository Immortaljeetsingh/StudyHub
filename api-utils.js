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
            if (typeof openApiSettings === 'function') openApiSettings();
            throw new Error('API key limit reached — settings opened. Enter a new key or get one free at openrouter.ai/keys');
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
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('studyhub-theme', isLight ? 'light' : 'dark');
    const btn = document.getElementById('themeToggleBtn'); if (btn) btn.textContent = isLight ? '☀️ Light' : '🌙 Dark';
}
function loadTheme() { if (localStorage.getItem('studyhub-theme') === 'light') { document.body.classList.add('light-theme'); const btn = document.getElementById('themeToggleBtn'); if (btn) btn.textContent = '☀️ Light'; } }

// ==================== API SETTINGS ====================
function openApiSettings() {
    const m = document.getElementById('apiSettingsModal'); if (!m) return;
    m.classList.add('active');
    const k = document.getElementById('apiKeyInput'); if (k) k.value = localStorage.getItem('openrouter-api-key') || '';
    const s = document.getElementById('apiModelSelect'); if (s) s.value = localStorage.getItem('openrouter-model') || DEFAULT_MODEL;
}
function closeApiSettings() { const m = document.getElementById('apiSettingsModal'); if (m) m.classList.remove('active'); }
function saveApiSettings() {
    const key = document.getElementById('apiKeyInput')?.value?.trim();
    const model = document.getElementById('apiModelSelect')?.value;
    const status = document.getElementById('apiSettingsStatus');
    if (!key) { if (status) { status.textContent = '❌ Enter an API key'; status.className = 'modal-status error'; } return; }
    localStorage.setItem('openrouter-api-key', key); localStorage.setItem('openrouter-model', model);
    if (status) { status.textContent = '✅ Saved!'; status.className = 'modal-status success'; }
    setTimeout(closeApiSettings, 1200);
}
function resetApiSettings() {
    localStorage.removeItem('openrouter-api-key'); localStorage.removeItem('openrouter-model');
    const k = document.getElementById('apiKeyInput'); if (k) k.value = '';
    const s = document.getElementById('apiModelSelect'); if (s) s.value = DEFAULT_MODEL;
    const status = document.getElementById('apiSettingsStatus'); if (status) { status.textContent = '🔄 Reset to defaults'; status.className = 'modal-status success'; }
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

// ==================== COMPONENTS ====================
function renderApiSettingsModal() {
    const opts = FREE_MODELS.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    return `<div id="apiSettingsModal" class="modal-overlay" onclick="if(event.target===this)closeApiSettings()"><div class="modal-box"><h2>⚙️ API Settings</h2><label for="apiKeyInput">OpenRouter API Key</label><input type="password" id="apiKeyInput" placeholder="sk-or-v1-..."><label for="apiModelSelect">Model</label><select id="apiModelSelect" style="width:100%;padding:0.7rem 0.9rem;border-radius:var(--radius-sm);background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--text-primary);font-size:0.9rem;font-family:inherit;">${opts}</select><div class="modal-actions"><button class="btn btn-primary" onclick="saveApiSettings()">💾 Save</button><button class="btn btn-outline" onclick="resetApiSettings()">🔄 Reset</button><button class="btn btn-outline" onclick="closeApiSettings()">Cancel</button></div><div id="apiSettingsStatus" class="modal-status"></div><p style="margin-top:0.75rem;font-size:0.8rem;color:var(--text-muted)">Key is pre-configured. Change model or use your own. <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--accent)">Get a key</a></p></div></div>`;
}

function renderToolbar(subjectCode) {
    const L = { 'mmpc-01':{study:'study-mmpc01.html',quiz:'quiz-mmpc01.html'},'mmpc-02':{study:'study-mmpc02.html',quiz:'quiz-mmpc02.html'},'mmpc-03':{study:'study-mmpc03.html',quiz:'quiz-mmpc03.html'},'mmpc-04':{study:'study-mmpc04.html',quiz:'quiz-mmpc04.html'},'mmpc-05':{study:'study-mmpc05.html',quiz:'quiz-mmpc05.html'},'mmpc-06':{study:'study-mmpc06.html',quiz:'quiz-mmpc06.html'},'mmpc-07':{study:'study-mmpc07.html',quiz:'quiz-mmpc07.html'} };
    const l = L[subjectCode] || {};
    return `<div class="top-toolbar"><a href="study-hub.html" class="btn btn-outline" style="margin-right:auto">← Hub</a>${l.study?`<a href="${l.study}" class="btn btn-outline">📘 Study</a>`:''}${l.quiz?`<a href="${l.quiz}" class="btn btn-outline">📝 Quiz</a>`:''}<button id="themeToggleBtn" class="btn btn-outline" onclick="toggleTheme()">🌙 Dark</button><button class="btn btn-outline" onclick="openApiSettings()">⚙️ API</button></div>`;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('apiSettingsModal')) { const c = document.createElement('div'); c.innerHTML = renderApiSettingsModal(); document.body.appendChild(c.firstElementChild); }
    loadTheme(); initSummarizeButtons(); initAskButtons(); initReadingProgress();

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
