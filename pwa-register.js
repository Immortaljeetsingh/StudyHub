// PWA Registration — drop this script into any page via <script src="pwa-register.js"></script>

(function () {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
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

  // ── Manual install banner for iOS and non-Chromium browsers ────
  (function addManualBanner() {
    var ua = navigator.userAgent;
    var isIOS = /iphone|ipad|ipod/i.test(ua);
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches
                    || window.navigator.standalone === true;
    if (!isIOS || isStandalone) return;

    // Only show if the native beforeinstallprompt hasn't fired within 2s
    setTimeout(function () {
      if (deferredPrompt) return; // native prompt available, skip
      if (document.getElementById('pwa-install-banner')) return;
      if (sessionStorage.getItem('pwa-install-dismissed')) return;

      var banner = document.createElement('div');
      banner.id = 'pwa-install-banner';
      banner.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">' +
          '<span style="font-size:28px;flex-shrink:0">📲</span>' +
          '<div style="min-width:0">' +
            '<div style="font-weight:700;font-size:14px;margin-bottom:3px">Install StudyHub</div>' +
            '<div style="font-size:13px;opacity:0.9;line-height:1.3">' +
              'Tap <strong>Share</strong> <span style="font-size:16px;vertical-align:middle">⬆️</span> then <strong>Add to Home Screen</strong>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button id="pwa-install-dismiss" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;padding:4px 8px;opacity:0.7;flex-shrink:0;line-height:1">✕</button>';

      Object.assign(banner.style, {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: '2147483647',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
        opacity: '0',
        transform: 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease'
      });

      document.body.appendChild(banner);
      banner.offsetHeight; // force reflow
      requestAnimationFrame(function () {
        banner.style.opacity = '1';
        banner.style.transform = 'translateY(0)';
      });

      document.getElementById('pwa-install-dismiss').addEventListener('click', function () {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(100%)';
        sessionStorage.setItem('pwa-install-dismissed', '1');
        setTimeout(function () { banner.remove(); }, 400);
      });
    }, 2000);
  })();
})();
