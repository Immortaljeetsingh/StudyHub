// Minimal DOM/localStorage stubs so quiz-engine.js runs under node.
const els = {};
function el(id) { return els[id] || (els[id] = { classList: { add() {}, remove() {} }, style: {}, textContent: '', innerHTML: '' }); }
const store = {};
global.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    get length() { return Object.keys(store).length; }
};
global.window = { location: { href: '' } };
global.document = {
    getElementById: el,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ className: '', style: {}, remove() {} }),
    body: { appendChild() {} }
};
global.confirm = () => true;

require('./quiz-engine.js');
const assert = require('assert');
const Q = global.window.QuizEngine;
assert(Q, 'QuizEngine must be global (window.QuizEngine)');

const questions = [
    { question: 'q1', options: ['a', 'b'], answer: 0, explanation: 'e' },
    { question: 'q2', options: ['a', 'b'], answer: 0, explanation: 'e' },
    { question: 'q3', options: ['a', 'b'], answer: 0, explanation: 'e' },
    { question: 'q4', options: ['a', 'b'], answer: 0, explanation: 'e' },
    { question: 'q5', options: ['a', 'b'], answer: 0, explanation: 'e' }
];
const q = new Q('mmpc01', 'MMPC01', questions);

// 1. init syncs score display and starts timer
q.init();
assert(q.timerInterval !== null, 'timer starts on init');
assert(String(el('scoreVal').textContent) === '0', 'scoreVal synced on init');

// 2. pause (visibilitychange) must NOT flip timerEnabled; resume works; no double intervals
q.toggleTimer(false);
assert(q.timerEnabled === true, 'pause keeps timerEnabled');
assert(q.timerInterval === null, 'pause clears interval');
q.toggleTimer(true);
assert(q.timerInterval !== null, 'resume restarts interval');
q.toggleTimer(true); // repeat resume must not stack intervals
assert(q.timerInterval !== null, 'resume after resume still has an interval');
q.timeLeft = 0; // force expiry via interval

// 3. manual toggle off/on
q.toggleTimer();
assert(q.timerEnabled === false, 'manual toggle flips off');
q.toggleTimer();
assert(q.timerEnabled === true, 'manual toggle flips on');

// 4. selectAnswer on last question finishes: keys written, state finished, timer stopped
for (let i = 0; i < questions.length; i++) {
    q.selectAnswer(0); // all correct -> +10 each
    if (i < questions.length - 1) q.next();
}
assert(q.state === 'finished', 'state finished when all answered');
assert(q.timerInterval === null, 'timer stopped when all answered');
assert(store['studyhub-quiz-mmpc01'] === '100', 'score key written');
assert(store['studyhub-quiz-mmpc01-details'], 'details key written');
assert(store['studyhub-progress-mmpc01'] === '100', 'progress unlocked at >=80%');
assert(JSON.parse(store['studyhub-quiz-mmpc01-details']).percentage === 100, 'details JSON valid');

// 5. startTimer is a no-op once finished
q.toggleTimer(true);
assert(q.timerInterval === null, 'no timer restart after finish');

// 6. fresh engine reloads saved state and shows saved score
const q2 = new Q('mmpc01', 'MMPC01', questions);
q2.init();
assert(String(el('scoreVal').textContent) === '50', 'score restored from saved state on reload');
assert(q2.timerInterval === null, 'timer not started for finished saved state');

console.log('ALL QUIZ-ENGINE CHECKS PASS');
process.exit(0);
