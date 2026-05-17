/**
 * Flashcards Quick Review System
 * Extracts key takeaways and creates flippable flashcards
 */
(function() {
    'use strict';

    const FLASHCARDS_KEY = 'studyhub-flashcards-progress';

    class FlashcardSystem {
        constructor() {
            this.cards = [];
            this.currentIndex = 0;
            this.panel = null;
            this.isFlipped = false;
            
            this.init();
        }

        init() {
            // Flashcards button removed - use sidebar link to flashcards.html
            // this.addFlashcardButton();
        }

        addFlashcardButton() {
            const btn = document.createElement('button');
            btn.className = 'flashcards-toggle';
            btn.id = 'flashcardsToggle';
            btn.setAttribute('aria-label', 'Open Flashcards');
            btn.innerHTML = '🃏';
            btn.addEventListener('click', () => this.openFlashcards());
            document.body.appendChild(btn);
        }

        openFlashcards() {
            if (this.panel) {
                this.panel.classList.toggle('active');
                return;
            }

            this.panel = this.createPanel();
            document.body.appendChild(this.panel);
            
            // Extract cards from current page
            this.extractCards();
            
            if (this.cards.length === 0) {
                alert('No key takeaways found on this page. Flashcards work best on study pages with .kt sections.');
                this.panel.remove();
                this.panel = null;
                return;
            }
            
            this.panel.classList.add('active');
            this.renderCard();
            this.bindPanelEvents();
        }

        createPanel() {
            const panel = document.createElement('div');
            panel.className = 'flashcards-panel';
            panel.innerHTML = `
                <div class="flashcard-container">
                    <button class="flashcards-close" aria-label="Close flashcards">×</button>
                    <div class="flashcard" id="flashcard">
                        <div class="flashcard-face flashcard-front" id="cardFront">
                            <div class="flashcard-label">Question</div>
                            <div class="flashcard-content" id="cardFrontContent"></div>
                        </div>
                        <div class="flashcard-face flashcard-back" id="cardBack">
                            <div class="flashcard-label">Answer</div>
                            <div class="flashcard-content" id="cardBackContent"></div>
                        </div>
                    </div>
                    <div class="flashcard-nav">
                        <button class="flashcard-prev">← Previous</button>
                        <span class="flashcard-counter" id="cardCounter">1 / 1</span>
                        <button class="flashcard-next">Next →</button>
                    </div>
                    <div style="text-align: center; margin-top: 1rem;">
                        <button class="flashcard-btn" id="flashcardFlip">Flip Card (Space)</button>
                    </div>
                </div>
            `;
            return panel;
        }

        extractCards() {
            // Extract from .kt (key takeaways) sections
            const ktSections = document.querySelectorAll('.kt');
            this.cards = [];
            
            ktSections.forEach(section => {
                const title = section.querySelector('h4')?.textContent || 'Key Takeaway';
                const content = section.querySelector('ul, p')?.innerHTML || section.innerHTML;
                
                if (content) {
                    this.cards.push({
                        front: title,
                        back: content
                    });
                }
            });

            // Also extract from <h3> and <h4> headings as Q/A pairs
            const headings = document.querySelectorAll('h3, h4');
            headings.forEach((heading, i) => {
                const nextEl = heading.nextElementSibling;
                if (nextEl && (nextEl.tagName === 'P' || nextEl.tagName === 'UL')) {
                    const question = heading.textContent;
                    const answer = nextEl.innerHTML;
                    
                    // Avoid duplicates
                    if (!this.cards.some(c => c.front === question)) {
                        this.cards.push({
                            front: question,
                            back: answer
                        });
                    }
                }
            });
        }

        renderCard() {
            if (this.cards.length === 0) return;
            
            const card = this.cards[this.currentIndex];
            const frontContent = document.getElementById('cardFrontContent');
            const backContent = document.getElementById('cardBackContent');
            const counter = document.getElementById('cardCounter');
            
            frontContent.innerHTML = this.stripHtml(card.front);
            backContent.innerHTML = card.back;
            counter.textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
            
            // Reset flip state
            const flashcard = document.getElementById('flashcard');
            flashcard.classList.remove('flipped');
            this.isFlipped = false;
        }

        stripHtml(html) {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        }

        flipCard() {
            const flashcard = document.getElementById('flashcard');
            flashcard.classList.toggle('flipped');
            this.isFlipped = !this.isFlipped;
        }

        nextCard() {
            if (this.currentIndex < this.cards.length - 1) {
                this.currentIndex++;
                this.renderCard();
            }
        }

        prevCard() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.renderCard();
            }
        }

        bindPanelEvents() {
            const panel = this.panel;
            
            // Close
            panel.querySelector('.flashcards-close').addEventListener('click', () => {
                panel.classList.remove('active');
            });
            
            // Flip
            panel.querySelector('#flashcardFlip').addEventListener('click', () => this.flipCard());
            panel.querySelector('#flashcard').addEventListener('click', () => this.flipCard());
            
            // Navigation
            panel.querySelector('.flashcard-prev').addEventListener('click', () => this.prevCard());
            panel.querySelector('.flashcard-next').addEventListener('click', () => this.nextCard());
            
            // Keyboard
            const keyHandler = (e) => {
                if (!panel.classList.contains('active')) return;
                
                switch (e.key) {
                    case ' ':
                    case 'Spacebar':
                        e.preventDefault();
                        this.flipCard();
                        break;
                    case 'ArrowLeft':
                        this.prevCard();
                        break;
                    case 'ArrowRight':
                        this.nextCard();
                        break;
                    case 'Escape':
                        panel.classList.remove('active');
                        break;
                }
            };
            
            document.addEventListener('keydown', keyHandler);
        }
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new FlashcardSystem());
    } else {
        new FlashcardSystem();
    }
})();
