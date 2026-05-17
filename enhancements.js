/* ===== StudyHub Enhancements — CSS+JS only, no HTML changes ===== */
(function () {
  'use strict';

  // ── 1. Scroll Animation Observer ──────────────────────────────────
  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });
  }

  // ── 2. Subject Progress Rings (hub page only) ─────────────────────
  function initProgressRings() {
    const grid = document.getElementById('subjects');
    if (!grid) return;

    const cards = grid.querySelectorAll('[data-subject], .subject-card, .card');
    if (!cards.length) return;

    // Build a color map from existing cards (read accent color from style or data)
    const defaultColors = [
      '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
      '#3b82f6', '#8b5cf6', '#10b981', '#ef4444',
    ];

    cards.forEach((card, idx) => {
      // Derive subject id from card attributes or fallback to index
      const id =
        card.dataset.subject ||
        card.dataset.id ||
        card.id ||
        card.querySelector('a')?.href?.match(/subject[=-](\w+)/)?.[1] ||
        `card-${idx}`;

      const progress = Math.min(
        100,
        Math.max(0, parseInt(localStorage.getItem(`studyhub-progress-${id}`) || '0', 10))
      );

      // Pick color from card's border / accent or fallback
      const computed = getComputedStyle(card);
      const accent =
        card.dataset.color ||
        computed.borderLeftColor ||
        computed.borderColor ||
        defaultColors[idx % defaultColors.length];

      // Build SVG ring
      const circumference = 2 * Math.PI * 16; // r=16 → ~100.53
      const offset = circumference - (progress / 100) * circumference;

      const wrapper = document.createElement('div');
      wrapper.className = 'subject-progress-ring';
      wrapper.innerHTML = `
        <svg viewBox="0 0 40 40">
          <circle class="ring-bg" cx="20" cy="20" r="16" />
          <circle class="ring-fill" cx="20" cy="20" r="16"
            stroke="${accent}"
            style="stroke-dasharray:${circumference};stroke-dashoffset:${offset}" />
        </svg>
        <span class="ring-text">${progress}%</span>
      `;

      // Make card position relative if not already
      const pos = getComputedStyle(card).position;
      if (pos === 'static') card.style.position = 'relative';

      card.appendChild(wrapper);

      // Animate after a tick so the transition triggers
      requestAnimationFrame(() => {
        const fill = wrapper.querySelector('.ring-fill');
        if (fill) fill.style.strokeDashoffset = offset;
      });
    });
  }

  // ── 3. Achievement Badges ─────────────────────────────────────────
  const ACHIEVEMENTS = {
    'first-unit':   { icon: '📖', title: 'First Steps',     desc: 'Opened your first study page' },
    'quiz-taken':   { icon: '✅', title: 'Quiz Whiz',       desc: 'Completed your first quiz' },
    'all-quizzes':  { icon: '🏆', title: 'Quiz Master',     desc: 'Completed all 7 quizzes' },
    'subject-done': { icon: '🎓', title: 'Subject Master',  desc: 'Finished a subject 100%' },
    'week-streak':  { icon: '🔥', title: 'Week Warrior',    desc: '7+ day study streak' },
  };

  function getUnlocked() {
    try {
      return JSON.parse(localStorage.getItem('studyhub-achievements') || '[]');
    } catch {
      return [];
    }
  }

  function saveUnlocked(list) {
    localStorage.setItem('studyhub-achievements', JSON.stringify(list));
  }

  function showToast(achievement) {
    // Remove any existing toast
    document.querySelectorAll('.achievement-toast').forEach((t) => t.remove());

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <span class="toast-icon">${achievement.icon}</span>
      <div>
        <div class="toast-label">Achievement Unlocked</div>
        <div class="toast-title">${achievement.title}</div>
      </div>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  function unlock(key) {
    const unlocked = getUnlocked();
    if (unlocked.includes(key)) return;
    unlocked.push(key);
    saveUnlocked(unlocked);
    if (ACHIEVEMENTS[key]) showToast(ACHIEVEMENTS[key]);
  }

  function checkAchievements() {
    // "first-unit" — any study page opened (check for study-page body class or URL pattern)
    if (
      window.location.pathname.includes('study') ||
      document.body.classList.contains('study-page') ||
      document.querySelector('.study-content, .unit-content, .lesson-content')
    ) {
      unlock('first-unit');
    }

    // "quiz-taken" — check for quiz-related localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('quiz-score') || key.includes('quiz-result') || key.includes('quiz-completed'))) {
        unlock('quiz-taken');
        break;
      }
    }

    // "all-quizzes" — count completed quizzes
    let quizCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('quiz-score') || key.includes('quiz-result') || key.includes('quiz-completed'))) {
        quizCount++;
      }
    }
    if (quizCount >= 7) unlock('all-quizzes');

    // "subject-done" — any subject at 100%
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('studyhub-progress-')) {
        if (parseInt(localStorage.getItem(key), 10) >= 100) {
          unlock('subject-done');
          break;
        }
      }
    }

    // "week-streak" — track study days
    const today = new Date().toISOString().slice(0, 10);
    let streakData;
    try {
      streakData = JSON.parse(localStorage.getItem('studyhub-streak') || '{}');
    } catch {
      streakData = {};
    }

    if (!streakData[today]) {
      streakData[today] = true;
      // Prune old entries (keep last 30 days)
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      Object.keys(streakData).forEach((d) => {
        if (d < cutoffStr) delete streakData[d];
      });
      localStorage.setItem('studyhub-streak', JSON.stringify(streakData));
    }

    // Count consecutive days ending today
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const ds = checkDate.toISOString().slice(0, 10);
      if (streakData[ds]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    if (streak >= 7) unlock('week-streak');
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    initScrollAnimations();
    // Small delay to let initDashboard() run first on hub page
    setTimeout(() => {
      initProgressRings();
      checkAchievements();
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
