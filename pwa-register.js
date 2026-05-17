// PWA Registration — drop this script into any page via <script src="pwa-register.js"></script>

(function () {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('[PWA] Service worker registration failed:', err);
    });
  }

  // Install prompt
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  function showInstallButton() {
    if (document.getElementById('pwa-install-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.textContent = '📲 Install App';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: '9999',
      padding: '10px 18px',
      borderRadius: '24px',
      border: 'none',
      background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
      transition: 'transform 0.2s, opacity 0.3s',
      opacity: '0',
      transform: 'translateY(10px)'
    });

    btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.05)');
    btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');

    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      btn.remove();
      console.log('[PWA] Install outcome:', outcome);
    });

    document.body.appendChild(btn);

    // Animate in
    requestAnimationFrame(() => {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    });
  }
})();
