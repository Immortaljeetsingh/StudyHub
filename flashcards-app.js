// flashcards-app.js - Standalone flashcards review app
(function() {
    'use strict';

    const subjects = [
        { id: 'mmpc-01', file: 'study-mmpc01.html' },
        { id: 'mmpc-02', file: 'study-mmpc02.html' },
        { id: 'mmpc-03', file: 'study-mmpc03.html' },
        { id: 'mmpc-04', file: 'study-mmpc04.html' },
        { id: 'mmpc-05', file: 'study-mmpc05.html' },
        { id: 'mmpc-06', file: 'study-mmpc06.html' },
        { id: 'mmpc-07', file: 'study-mmpc07.html' }
    ];

    let allCards = [];
    let currentCards = [];
    let currentIndex = 0;
    let isFlipped = false;

    async function loadAllCards() {
        const cards = [];
        let loadFailed = false;
        for (const subject of subjects) {
            try {
                const response = await fetch(subject.file);
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const ktSections = doc.querySelectorAll('.kt, .summary-box');
                ktSections.forEach(section => {
                    let title = section.querySelector('h4')?.textContent.trim() || '';
                    if (!title) {
                        const strong = section.querySelector('strong');
                        title = strong && strong.textContent.trim().endsWith(':')
                            ? strong.textContent.trim().replace(/:$/, '') : '';
                    }
                    const content = section.innerHTML;
                    if (content) {
                        cards.push({
                            subject: subject.id.toUpperCase(),
                            front: title || 'Key Takeaway',
                            back: content
                        });
                    }
                });
            } catch (e) {
                loadFailed = true;
                console.error(`Failed to load ${subject.file}:`, e);
            }
        }
        return { cards, loadFailed };
    }

    function renderFlashcards(cards, loadFailed) {
        currentCards = cards;
        currentIndex = 0;
        isFlipped = false;

        const panel = document.getElementById('flashcardPanel');
        const noCards = document.getElementById('noCards');

        if (cards.length === 0) {
            panel.innerHTML = '';
            noCards.querySelector('p').textContent = loadFailed
                ? 'Could not load flashcards - check your internet connection and try again.'
                : 'No flashcards found. Please select a subject with key takeaways.';
            noCards.style.display = 'block';
            return;
        }

        noCards.style.display = 'none';
        panel.innerHTML = `
            <div style="text-align: center; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.85rem;">
                Subject: <span id="cardSubject">${cards[0].subject}</span>
            </div>
            <div class="flashcard-container" style="width: 100%; max-width: 600px;">
                <div class="flashcard ${isFlipped ? 'flipped' : ''}" id="flashcard" 
                     style="height: 400px; position: relative; transform-style: preserve-3d; 
                            transition: transform 0.6s; cursor: pointer;">
                    <div class="flashcard-face flashcard-front" 
                         style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; 
                                background: var(--glass-strong); backdrop-filter: var(--blur-strong); 
                                border: 1px solid var(--glass-border); border-radius: var(--radius); 
                                padding: 2rem; display: flex; flex-direction: column; 
                                align-items: center; justify-content: center; text-align: center;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; 
                                    color: var(--text-muted); margin-bottom: 1rem;">Question</div>
                        <div id="cardFront" style="font-size: 1.1rem; color: var(--text-primary); line-height: 1.6; 
                                    max-height: 280px; overflow-y: auto;"></div>
                    </div>
                    <div class="flashcard-face flashcard-back" 
                         style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; 
                                background: var(--glass-strong); backdrop-filter: var(--blur-strong); 
                                border: 1px solid var(--glass-border); border-radius: var(--radius); 
                                padding: 2rem; display: flex; flex-direction: column; 
                                align-items: center; justify-content: center; text-align: center;
                                transform: rotateY(180deg);">
                        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; 
                                    color: var(--text-muted); margin-bottom: 1rem;">Answer</div>
                        <div id="cardBack" style="font-size: 1rem; color: var(--text-primary); line-height: 1.6; 
                                    max-height: 280px; overflow-y: auto; text-align: left;"></div>
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.5rem;">
                <button class="flashcard-nav-btn" id="prevBtn">← Previous</button>
                <span id="cardCounter" style="font-size: 0.85rem; color: var(--text-muted);">1 / ${cards.length}</span>
                <button class="flashcard-nav-btn" id="nextBtn">Next →</button>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem;">
                <button id="flipBtn" style="padding: 0.5rem 1.5rem; background: rgba(94, 140, 240, 0.15); 
                            border: 1px solid rgba(94, 140, 240, 0.3); border-radius: 8px; color: var(--accent); 
                            font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;">
                    Flip Card (Space)
                </button>
                <button class="flashcard-nav-btn" id="shuffleBtn">Shuffle</button>
            </div>
        `;

        renderCard();
        bindEvents();
    }

    function renderCard() {
        if (currentCards.length === 0) return;
        const card = currentCards[currentIndex];
        document.getElementById('cardFront').textContent = card.front;
        document.getElementById('cardBack').innerHTML = card.back;
        document.getElementById('cardCounter').textContent = (currentIndex + 1) + ' / ' + currentCards.length;
        document.getElementById('cardSubject').textContent = card.subject;
        
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.remove('flipped');
        isFlipped = false;
    }

    function flipCard() {
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.toggle('flipped');
        isFlipped = !isFlipped;
    }

    function shuffleCards() {
        for (let i = currentCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
        }
        renderCard();
    }

    function nextCard() {
        if (currentIndex < currentCards.length - 1) { currentIndex++; renderCard(); }
    }

    function prevCard() {
        if (currentIndex > 0) { currentIndex--; renderCard(); }
    }

    function bindEvents() {
        document.getElementById('flipBtn').addEventListener('click', flipCard);
        document.getElementById('flashcard').addEventListener('click', flipCard);
        document.getElementById('prevBtn').addEventListener('click', prevCard);
        document.getElementById('nextBtn').addEventListener('click', nextCard);
        document.getElementById('shuffleBtn').addEventListener('click', shuffleCards);

        document.onkeydown = (e) => {
            switch(e.key) {
                case ' ': case 'Spacebar': e.preventDefault(); flipCard(); break;
                case 'ArrowLeft': prevCard(); break;
                case 'ArrowRight': nextCard(); break;
                case 's': case 'S': shuffleCards(); break;
                case 'Escape': window.location.href = 'study-hub.html'; break;
            }
        };
    }

    // Filter by subject
    document.getElementById('subjectSelector').addEventListener('click', (e) => {
        if (!e.target.classList.contains('subject-btn')) return;
        
        document.querySelectorAll('.subject-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const subject = e.target.dataset.subject;
        renderFlashcards(subject === 'all' ? allCards : allCards.filter(c => c.subject.toLowerCase() === subject));
    });

    // Initialize
    (async () => {
        const loaded = await loadAllCards();
        allCards = loaded.cards;
        renderFlashcards(allCards, loaded.loadFailed);
    })();
})();
