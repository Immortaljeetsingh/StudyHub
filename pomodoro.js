/**
 * Pomodoro Study Timer Widget
 * 25min study / 5min break intervals with notifications
 * Only shows on study-hub.html (dashboard)
 */
(function() {
    'use strict';

    const TIMES = {
        study: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    };
    const CYCLES_BEFORE_LONG = 4;
    const VALID_MODES = ['study', 'shortBreak', 'longBreak'];
    let audioCtx = null;

    class PomodoroTimer {
        constructor() {
            if (document.getElementById('pomodoroWidget')) return;
            this.timeLeft = TIMES.study;
            this.totalTime = TIMES.study;
            this.isRunning = false;
            this.mode = 'study';
            this.cycle = 1;
            this.intervalId = null;
            this.endTime = null;
            
            this.loadState();
            this.render();
            this.bindEvents();
            this.updateDisplay();
        }

        render() {
            const html = `
                <div class="pomodoro-widget" id="pomodoroWidget">
                    <div class="pomodoro-header">
                        <span class="pomodoro-mode" id="pomodoroMode">📚 Study</span>
                        <button class="pomodoro-collapse" id="pomodoroToggle">−</button>
                    </div>
                    <div class="pomodoro-body" id="pomodoroBody">
                        <div class="pomodoro-ring-wrap">
                            <svg class="pomodoro-ring" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
                                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--pomodoro-color, #5e8cf0)" 
                                        stroke-width="8" stroke-dasharray="339.29" stroke-dashoffset="339.29" 
                                        stroke-linecap="round" transform="rotate(-90 60 60)" id="pomodoroCircle"/>
                            </svg>
                            <div class="pomodoro-time" id="pomodoroTime">25:00</div>
                        </div>
                        <div class="pomodoro-controls">
                            <button class="pomodoro-btn" id="pomodoroStart">▶ Start</button>
                            <button class="pomodoro-btn" id="pomodoroReset">↺</button>
                        </div>
                        <div class="pomodoro-cycle" id="pomodoroCycle">Cycle 1/${CYCLES_BEFORE_LONG}</div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        bindEvents() {
            document.getElementById('pomodoroStart').addEventListener('click', () => this.toggle());
            document.getElementById('pomodoroReset').addEventListener('click', () => this.reset());
            document.getElementById('pomodoroToggle').addEventListener('click', () => this.toggleView());
        }

        toggle() {
            this.isRunning ? this.pause() : this.start();
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
            this.endTime = Date.now() + this.timeLeft * 1000;
            this.updateBtn();
            this.intervalId = setInterval(() => this.tick(), 1000);
        }

        pause() {
            if (!this.isRunning) return;
            this.isRunning = false;
            clearInterval(this.intervalId);
            this.timeLeft = Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
            this.updateDisplay();
            this.updateBtn();
            this.saveState();
        }

        reset() {
            this.pause();
            this.endTime = null;
            this.timeLeft = this.totalTime;
            this.updateDisplay();
            this.saveState();
        }

        tick() {
            this.timeLeft = Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
            if (this.timeLeft <= 0) {
                this.complete();
            } else {
                this.updateDisplay();
                this.saveState();
            }
        }

        complete() {
            this.pause();
            this.notify();
            this.nextMode();
        }

        nextMode() {
            if (this.mode === 'study') {
                if (this.cycle >= CYCLES_BEFORE_LONG) {
                    this.mode = 'longBreak';
                    this.totalTime = TIMES.longBreak;
                    this.cycle = 0;
                } else {
                    this.mode = 'shortBreak';
                    this.totalTime = TIMES.shortBreak;
                }
            } else {
                this.mode = 'study';
                this.totalTime = TIMES.study;
                this.cycle++;
            }
            this.timeLeft = this.totalTime;
            this.updateDisplay();
            this.saveState();
        }

        notify() {
            const messages = {
                study: '⏰ Study session complete! Take a break.',
                shortBreak: '✅ Break over! Ready to study?',
                longBreak: '🎉 Long break over! Ready for next cycle?'
            };
            
            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('StudyHub Pomodoro', {
                    body: messages[this.mode],
                    icon: '🍅'
                });
            }
            
            // Audio beep
            this.beep();
            
            // Visual flash
            const widget = document.getElementById('pomodoroWidget');
            if (widget) {
                widget.classList.add('pomodoro-flash');
                setTimeout(() => widget.classList.remove('pomodoro-flash'), 1000);
            }
        }

        beep() {
            try {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx.state === 'suspended') audioCtx.resume();
                [800, 1000, 800].forEach((freq, i) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.2 + 0.15);
                    osc.start(audioCtx.currentTime + i * 0.2);
                    osc.stop(audioCtx.currentTime + i * 0.2 + 0.15);
                });
            } catch (e) {}
        }

        updateDisplay() {
            const min = String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
            const sec = String(this.timeLeft % 60).padStart(2, '0');
            const timeEl = document.getElementById('pomodoroTime');
            if (timeEl) timeEl.textContent = `${min}:${sec}`;
            
            const pct = (this.totalTime - this.timeLeft) / this.totalTime;
            const offset = 339.29 * (1 - pct);
            const circle = document.getElementById('pomodoroCircle');
            if (circle) circle.setAttribute('stroke-dashoffset', offset);
            
            const modeIcons = { study: '📚', shortBreak: '☕', longBreak: '🏖️' };
            const modeText = { study: 'Study', shortBreak: 'Short Break', longBreak: 'Long Break' };
            const modeEl = document.getElementById('pomodoroMode');
            if (modeEl) modeEl.textContent = `${modeIcons[this.mode]} ${modeText[this.mode]}`;
            
            const cycleEl = document.getElementById('pomodoroCycle');
            if (cycleEl) cycleEl.textContent = `Cycle ${Math.max(this.cycle, 1)}/${CYCLES_BEFORE_LONG}`;
            
            // Color based on mode
            const colors = { study: '#5e8cf0', shortBreak: '#34d399', longBreak: '#fbbf24' };
            const widget = document.getElementById('pomodoroWidget');
            if (widget) widget.style.setProperty('--pomodoro-color', colors[this.mode]);
        }

        updateBtn() {
            const btn = document.getElementById('pomodoroStart');
            if (btn) btn.textContent = this.isRunning ? '⏸ Pause' : '▶ Start';
        }

        toggleView() {
            const widget = document.getElementById('pomodoroWidget');
            const body = document.getElementById('pomodoroBody');
            const btn = document.getElementById('pomodoroToggle');
            if (!widget || !body || !btn) return;
            
            const isCollapsed = body.style.display === 'none';
            body.style.display = isCollapsed ? 'block' : 'none';
            btn.textContent = isCollapsed ? '−' : '+';
            widget.classList.toggle('pomodoro-collapsed', !isCollapsed);
        }

        saveState() {
            const state = {
                timeLeft: this.timeLeft,
                totalTime: this.totalTime,
                mode: this.mode,
                cycle: this.cycle
            };
            localStorage.setItem('pomodoro-state', JSON.stringify(state));
        }

        loadState() {
            try {
                const saved = localStorage.getItem('pomodoro-state');
                if (saved) {
                    const s = JSON.parse(saved);
                    this.timeLeft = s.timeLeft || TIMES.study;
                    this.totalTime = s.totalTime || TIMES.study;
                    this.mode = VALID_MODES.includes(s.mode) ? s.mode : 'study';
                    this.cycle = s.cycle || 1;
                }
            } catch (e) {}
        }
    }

    // Init whenever the script is present
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new PomodoroTimer());
    } else {
        new PomodoroTimer();
    }
})();
