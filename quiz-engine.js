class QuizEngine {
    constructor(courseId, courseName, questions) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.questions = questions;
        this.currentQ = 0;
        this.score = 0;
        this.userAnswers = {};
        this.reviewedQuestions = new Set();
        this.timerEnabled = true;
        this.timerInterval = null;
        this.timeLeft = 20 * 60;
        this.state = 'in-progress';
    }

    init() {
        this.loadState();
        this.renderNav();
        this.renderCurrent();
        this.updateProgress();
        this.updateTimerDisplay();
        document.getElementById('scoreVal').textContent = this.score;
        this.startTimer();
    }

    loadState() {
        const saved = localStorage.getItem(`quiz-state-${this.courseId}`);
        if (saved) {
            const state = JSON.parse(saved);
            this.currentQ = state.currentQ || 0;
            this.score = state.score || 0;
            this.userAnswers = state.userAnswers || {};
            this.reviewedQuestions = new Set(state.reviewedQuestions || []);
            this.timeLeft = state.timeLeft !== undefined ? state.timeLeft : 20 * 60;
            this.state = state.state || 'in-progress';
        }
    }

    saveState() {
        const state = {
            currentQ: this.currentQ,
            score: this.score,
            userAnswers: this.userAnswers,
            reviewedQuestions: Array.from(this.reviewedQuestions),
            timeLeft: this.timeLeft,
            courseId: this.courseId,
            state: this.state,
            timestamp: Date.now()
        };
        localStorage.setItem(`quiz-state-${this.courseId}`, JSON.stringify(state));
    }

    renderCurrent() {
        const q = this.getCurrentQuestion();
        if (!q) return;

        document.getElementById('currentQ').textContent = this.currentQ + 1;
        document.getElementById('questionTitle').textContent = `Q${this.currentQ + 1}: ${q.question}`;

        let optionsHtml = '';
        q.options.forEach((opt, i) => {
            const isAnswered = this.userAnswers[this.currentQ] !== undefined;
            const isSelected = this.userAnswers[this.currentQ] === i;
            const isCorrect = i === q.answer;
            const isUserCorrect = isSelected && isCorrect;
            const isUserIncorrect = isSelected && !isCorrect;

            let cls = '';
            if (isAnswered) {
                if (i === q.answer) cls = 'correct-answer';
                else if (isUserIncorrect) cls = 'incorrect-answer';
            }

            optionsHtml += `
                <div class="${cls}">
                    <input type="radio" id="opt${i}" name="answer" class="option-input" value="${i}"
                        ${isSelected ? 'checked' : ''} ${isAnswered ? 'disabled' : ''}
                        onchange="quizEngine.selectAnswer(${i})">
                    <label class="option-label" for="opt${i}">
                        <span class="option-prefix">${String.fromCharCode(65 + i)}</span>
                        <span class="option-text">${opt}</span>
                    </label>
                </div>
            `;
        });

        document.getElementById('answerOptions').innerHTML = optionsHtml;

        const explanationArea = document.getElementById('explanationArea');
        if (this.userAnswers[this.currentQ] !== undefined) {
            const isCorrect = this.userAnswers[this.currentQ] === q.answer;
            const badgeClass = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
            const badgeText = isCorrect ? '✓ Correct' : '✗ Incorrect';
            const userChoice = q.options[this.userAnswers[this.currentQ]];
            const correctChoice = q.options[q.answer];

            explanationArea.innerHTML = `
                <div class="feedback-badge ${badgeClass}">
                    ${badgeText}
                </div>
                <div class="explanation-box">
                    <strong>${isCorrect ? '✓ Correct!' : 'Your answer: ' + userChoice}</strong>
                    ${!isCorrect ? `<br><strong style="color:var(--success)">Correct answer: ${correctChoice}</strong><br><br>` : ''}
                    ${q.explanation}
                </div>
            `;
        } else {
            explanationArea.innerHTML = '';
        }

        this.updateNavBtnState();
    }

    renderNav() {
        const grids = document.querySelectorAll('#questionNavGrid, #navGrid');
        grids.forEach(grid => {
            if (!grid) return;
            let html = '';
            this.questions.forEach((q, i) => {
                const answered = this.userAnswers[i] !== undefined;
                const isReviewed = this.reviewedQuestions.has(i);
                const isCurrent = i === this.currentQ;
                let cls = '';
                if (isCurrent) cls = 'current';
                else if (answered) cls = 'answered';
                else if (isReviewed) cls = 'reviewed';

                html += `<button class="question-nav-btn ${cls}" onclick="quizEngine.goTo(${i})" title="Question ${i + 1}">${i + 1}</button>`;
            });
            grid.innerHTML = html;
        });
    }

    updateNavBtnState() {
        document.querySelectorAll('.question-nav-btn').forEach((btn, i) => {
            btn.classList.remove('current', 'answered', 'reviewed');
            if (i === this.currentQ) btn.classList.add('current');
            else if (this.userAnswers[i] !== undefined) btn.classList.add('answered');
            else if (this.reviewedQuestions.has(i)) btn.classList.add('reviewed');
        });
    }

    getCurrentQuestion() {
        return this.questions[this.currentQ];
    }

    selectAnswer(idx) {
        const q = this.getCurrentQuestion();
        if (!q) return;
        if (this.userAnswers[this.currentQ] !== undefined) return;

        this.userAnswers[this.currentQ] = idx;
        this.renderCurrent();
        this.renderNav();
        this.updateProgress();

        if (idx === q.answer) {
            this.score += 10;
            document.getElementById('scoreVal').textContent = this.score;
            this.showToast('Correct! +10 points');
        }

        this.saveState();
        this.saveQuizResult();
    }

    saveQuizResult() {
        if (this.resultPrompted) return;
        const total = this.questions.length * 10;
        const pct = Math.round((this.score / total) * 100);
        const allAnswered = Object.keys(this.userAnswers).length === this.questions.length;

        if (allAnswered) {
            this.resultPrompted = true;
            this.state = 'finished';
            this.stopTimer();
            this.saveState();
            localStorage.setItem(`studyhub-quiz-${this.courseId}`, pct.toString());
            localStorage.setItem(`studyhub-quiz-${this.courseId}-details`, JSON.stringify({
                score: this.score,
                total: total,
                percentage: pct,
                courseId: this.courseId,
                questions: this.questions,
                timestamp: Date.now()
            }));

            if (this.questions.length >= 5 && pct >= 80) {
                localStorage.setItem(`studyhub-progress-${this.courseId}`, '100');
                this.showToast('Quiz complete! 100% progress unlocked.');
            }

            setTimeout(() => {
                if (confirm(`Quiz complete! Score: ${pct}%. View detailed results page?`)) {
                    window.location.href = `quiz-results.html?course=${this.courseId}`;
                }
            }, 500);
        }
    }

    next() {
        if (this.currentQ < this.questions.length - 1) {
            this.currentQ++;
            this.saveState();
            this.renderCurrent();
            this.renderNav();
            this.updateProgress();
        } else {
            this.finish();
        }
    }

    prev() {
        if (this.currentQ > 0) {
            this.currentQ--;
            this.saveState();
            this.renderCurrent();
            this.renderNav();
            this.updateProgress();
        }
    }

    goTo(idx) {
        if (idx >= 0 && idx < this.questions.length) {
            this.currentQ = idx;
            this.saveState();
            this.renderCurrent();
            this.renderNav();
            this.updateProgress();
        }
    }

    markReview() {
        if (this.reviewedQuestions.has(this.currentQ)) {
            this.reviewedQuestions.delete(this.currentQ);
            this.showToast('Removed from review');
        } else {
            this.reviewedQuestions.add(this.currentQ);
            this.showToast('Marked for review');
        }
        this.saveState();
        this.renderNav();
    }

    toggleTimer(forceState) {
        if (forceState === true) {
            this.timerEnabled = true;
            this.startTimer();
            document.getElementById('quizTimer').classList.add('active');
            this.showToast('Timer enabled');
        } else if (forceState === false) {
            // pause-only path (visibilitychange): keep timerEnabled so the timer can resume
            this.stopTimer();
            document.getElementById('quizTimer').classList.remove('active');
        } else {
            this.timerEnabled = !this.timerEnabled;
            if (this.timerEnabled) {
                this.startTimer();
                document.getElementById('quizTimer').classList.add('active');
                this.showToast('Timer enabled');
            } else {
                this.stopTimer();
                document.getElementById('quizTimer').classList.remove('active');
                this.showToast('Timer paused');
            }
        }
    }

    startTimer() {
        if (this.state === 'finished') return;
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 300) {
                document.getElementById('quizTimer').classList.add('warning');
            } else {
                document.getElementById('quizTimer').classList.remove('warning');
            }

            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.finish();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        const str = `${mins}:${secs.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = str;
        document.getElementById('timeVal').textContent = str;
    }

    updateProgress() {
        const pct = ((this.currentQ + 1) / this.questions.length) * 100;
        document.getElementById('progressBar').style.width = `${pct}%`;
        document.getElementById('progressText').textContent = `Question ${this.currentQ + 1} of ${this.questions.length}`;
    }

    randomize() {
        if (Object.keys(this.userAnswers).length > 0) {
            if (!confirm('Randomizing will clear all your answers. Continue?')) return;
        }
        this.shuffleArray(this.questions);
        this.currentQ = 0;
        this.score = 0;
        this.userAnswers = {};
        this.reviewedQuestions.clear();
        this.saveState();
        this.renderCurrent();
        this.renderNav();
        this.updateProgress();
        document.getElementById('scoreVal').textContent = '0';
        this.showToast('Questions randomized');
    }

    reviewMode() {
        const panel = document.getElementById('reviewPanel');
        panel.classList.toggle('active');
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    finish() {
        this.stopTimer();
        this.state = 'finished';
        const total = this.questions.length * 10;
        const pct = Math.round((this.score / total) * 100);
        const grade = this.getGrade(pct);

        localStorage.setItem(`studyhub-quiz-${this.courseId}`, pct.toString());
        localStorage.setItem(`studyhub-quiz-${this.courseId}-details`, JSON.stringify({
            score: this.score,
            total: total,
            percentage: pct,
            grade: grade,
            courseId: this.courseId,
            questions: this.questions,
            timestamp: Date.now()
        }));

        if (this.questions.length >= 5 && pct >= 80) {
            localStorage.setItem(`studyhub-progress-${this.courseId}`, '100');
        }

        window.location.href = `quiz-results.html?course=${this.courseId}`;
    }

    getGrade(pct) {
        if (pct >= 90) return 'A';
        if (pct >= 80) return 'B';
        if (pct >= 70) return 'C';
        if (pct >= 60) return 'D';
        return 'F';
    }

    showToast(msg) {
        const existing = document.querySelector('.quiz-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'quiz-toast';
        toast.textContent = msg;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-pill);
            font-weight: 600;
            z-index: 10000;
            animation: fadeInUp .3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

window.QuizEngine = QuizEngine;