// api-utils.js — Shared OpenRouter API + UI functions for StudyHub
// Include in study-hub.html and all study-mmpc*.html / quiz-mmpc*.html files

// ==================== OPENROUTER API ====================
async function callOpenRouter(text, systemPrompt) {
    const apiKey = localStorage.getItem('openrouter-api-key');
    const model = localStorage.getItem('openrouter-model') || 'google/gemini-2.0-flash-001';
    if (!apiKey) throw new Error('API key not set. Please configure in ⚙️ API Settings.');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ],
            temperature: 0.4,
            max_tokens: 1500
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || response.statusText);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

// ==================== SUMMARIZE ====================
function initSummarizeButtons() {
    document.querySelectorAll('.summarize-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.querySelector(targetId);
            if (!target) return;

            const text = target.innerText;
            btn.disabled = true;
            btn.textContent = '⏳ Summarizing...';

            try {
                const summary = await callOpenRouter(text,
                    'You are a study assistant for MBA students. Summarize the following study material into clear, concise bullet points. Highlight key definitions, important facts, and exam-relevant points. Use simple language a student can quickly revise from.');

                let outputDiv = btn.parentElement.querySelector('.ai-output');
                if (!outputDiv) {
                    outputDiv = document.createElement('div');
                    outputDiv.className = 'ai-output';
                    btn.parentElement.insertBefore(outputDiv, btn.nextSibling.nextSibling || null);
                }
                outputDiv.innerHTML = '<strong>📝 AI Summary:</strong>\n\n' + formatAIResponse(summary);
                outputDiv.classList.add('visible');
                btn.textContent = '✅ Summarized!';
                setTimeout(() => { btn.textContent = '📝 Summarize'; btn.disabled = false; }, 2000);
            } catch (e) {
                btn.textContent = '❌ Error';
                btn.disabled = false;
                setTimeout(() => { btn.textContent = '📝 Summarize'; }, 2000);
                showToast(e.message.includes('API key') ? '⚠️ Set your API key in ⚙️ Settings' : '❌ ' + e.message, 'error');
            }
        });
    });
}

// ==================== ASK AI ====================
function initAskButtons() {
    document.querySelectorAll('.ask-ai-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.querySelector(targetId);
            if (!target) return;

            const question = prompt('💬 Ask anything about this section:');
            if (!question || !question.trim()) return;

            const context = target.innerText;
            btn.disabled = true;
            btn.textContent = '🤔 Thinking...';

            try {
                const answer = await callOpenRouter(
                    `Context:\n${context}\n\nStudent's Question: ${question}`,
                    'You are a patient, friendly MBA tutor. Answer the student\'s question using the provided context. Use simple language, give examples where helpful, and format your response with bullet points or numbered steps. If the question is outside the context, still try to help but note you\'re going beyond the material.'
                );

                let outputDiv = btn.parentElement.querySelector('.ai-output');
                if (!outputDiv) {
                    outputDiv = document.createElement('div');
                    outputDiv.className = 'ai-output';
                    btn.parentElement.insertBefore(outputDiv, btn.nextSibling.nextSibling || null);
                }
                outputDiv.innerHTML = `<strong>💬 Q: ${escapeHtml(question)}</strong>\n\n` + formatAIResponse(answer);
                outputDiv.classList.add('visible');
                btn.textContent = '💬 Ask AI';
                btn.disabled = false;
            } catch (e) {
                btn.textContent = '❌ Error';
                btn.disabled = false;
                setTimeout(() => { btn.textContent = '💬 Ask AI'; }, 2000);
                showToast(e.message.includes('API key') ? '⚠️ Set your API key in ⚙️ Settings' : '❌ ' + e.message, 'error');
            }
        });
    });
}

// ==================== THEME TOGGLE ====================
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('studyhub-theme', isLight ? 'light' : 'dark');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.textContent = isLight ? '☀️ Light' : '🌙 Dark';
}

function loadTheme() {
    if (localStorage.getItem('studyhub-theme') === 'light') {
        document.body.classList.add('light-theme');
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.textContent = '☀️ Light';
    }
}

// ==================== API SETTINGS MODAL ====================
function openApiSettings() {
    const m = document.getElementById('apiSettingsModal');
    if (!m) return;
    m.classList.add('active');
    const keyInput = document.getElementById('apiKeyInput');
    const modelInput = document.getElementById('apiModelInput');
    if (keyInput) keyInput.value = localStorage.getItem('openrouter-api-key') || '';
    if (modelInput) modelInput.value = localStorage.getItem('openrouter-model') || 'google/gemini-2.0-flash-001';
}

function closeApiSettings() {
    const m = document.getElementById('apiSettingsModal');
    if (m) m.classList.remove('active');
}

function saveApiSettings() {
    const key = document.getElementById('apiKeyInput')?.value?.trim();
    const model = document.getElementById('apiModelInput')?.value?.trim();
    const status = document.getElementById('apiSettingsStatus');

    if (!key) { if (status) { status.textContent = '❌ Enter an API key'; status.className = 'modal-status error'; } return; }
    if (!model) { if (status) { status.textContent = '❌ Enter a model name'; status.className = 'modal-status error'; } return; }

    localStorage.setItem('openrouter-api-key', key);
    localStorage.setItem('openrouter-model', model);
    if (status) { status.textContent = '✅ Saved!'; status.className = 'modal-status success'; }
    setTimeout(closeApiSettings, 1200);
}

// ==================== READING PROGRESS BAR ====================
function initReadingProgress() {
    const bar = document.querySelector('.reading-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const h = document.documentElement;
        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
        bar.style.width = Math.min(pct, 100) + '%';
    });
}

// ==================== MOBILE SIDEBAR ====================
function toggleMobileSidebar() {
    const sb = document.querySelector('.study-sidebar');
    if (sb) sb.classList.toggle('mobile-open');
}

// ==================== HELPERS ====================
function formatAIResponse(text) {
    return escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n- /g, '\n• ')
        .replace(/\n(\d+)\. /g, '\n$1. ');
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function showToast(msg, type) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;border-radius:10px;font-family:Inter,sans-serif;font-size:0.9rem;z-index:99999;animation:fadeIn 0.3s ease;color:white;max-width:360px;box-shadow:0 8px 30px rgba(0,0,0,0.3);`;
    t.style.background = type === 'error' ? '#e53e3e' : type === 'success' ? '#48bb78' : '#667eea';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

// ==================== SHARED HTML COMPONENTS ====================
function renderApiSettingsModal() {
    return `
    <div id="apiSettingsModal" class="modal-overlay" onclick="if(event.target===this)closeApiSettings()">
        <div class="modal-box">
            <h2>⚙️ API Settings</h2>
            <label for="apiKeyInput">OpenRouter API Key</label>
            <input type="password" id="apiKeyInput" placeholder="sk-or-v1-...">
            <label for="apiModelInput">Model</label>
            <input type="text" id="apiModelInput" placeholder="google/gemini-2.0-flash-001">
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="saveApiSettings()">💾 Save</button>
                <button class="btn btn-outline" onclick="closeApiSettings()">Cancel</button>
            </div>
            <div id="apiSettingsStatus" class="modal-status"></div>
            <p style="margin-top:0.75rem;font-size:0.8rem;color:var(--text-muted)">Get your key at <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--accent)">openrouter.ai/keys</a></p>
        </div>
    </div>`;
}

function renderToolbar(subjectCode) {
    const links = {
        'mmpc-01': { study: 'study-mmpc01.html', quiz: 'quiz-mmpc01.html' },
        'mmpc-02': { study: 'study-mmpc02.html', quiz: 'quiz-mmpc02.html' },
        'mmpc-03': { study: 'study-mmpc03.html', quiz: 'quiz-mmpc03.html' },
        'mmpc-04': { study: 'study-mmpc04.html', quiz: 'quiz-mmpc04.html' },
        'mmpc-05': { study: 'study-mmpc05.html', quiz: 'quiz-mmpc05.html' },
        'mmpc-06': { study: 'study-mmpc06.html', quiz: 'quiz-mmpc06.html' },
        'mmpc-07': { study: 'study-mmpc07.html', quiz: 'quiz-mmpc07.html' },
    };
    const link = links[subjectCode] || {};
    return `
    <div class="top-toolbar">
        <a href="study-hub.html" class="btn btn-outline" style="margin-right:auto">← Hub</a>
        ${link.study ? `<a href="${link.study}" class="btn btn-outline">📘 Study</a>` : ''}
        ${link.quiz ? `<a href="${link.quiz}" class="btn btn-outline">📝 Quiz</a>` : ''}
        <button id="themeToggleBtn" class="btn btn-outline" onclick="toggleTheme()">🌙 Dark</button>
        <button class="btn btn-outline" onclick="openApiSettings()">⚙️ API</button>
    </div>`;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    // Inject API settings modal into page
    if (!document.getElementById('apiSettingsModal')) {
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = renderApiSettingsModal();
        document.body.appendChild(modalContainer.firstElementChild);
    }
    loadTheme();
    initSummarizeButtons();
    initAskButtons();
    initReadingProgress();
});
