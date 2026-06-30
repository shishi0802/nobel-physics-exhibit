(function () {
  'use strict';

  // Local MP3 files — CC0/public domain recordings via Musopen/Internet Archive
  const musicFiles = {
    hall:     './assets/music/hall.mp3',      // Bach: Goldberg Variations - Aria
    test:     './assets/music/test.mp3',      // Grieg: Morning Mood
    corridor: './assets/music/corridor.mp3',  // Haydn: Lark Quartet - Adagio
    scale:    './assets/music/scale.mp3',     // Mendelssohn: Hebrides Overture
    quantum:  './assets/music/quantum.mp3',   // Bach: Goldberg Variation 25
    imaging:  './assets/music/imaging.mp3',   // Dvorak: American Quartet - Lento
    light:    './assets/music/light.mp3',     // Mendelssohn: Scottish Sym. - Adagio
    time:     './assets/music/time.mp3'       // Borodin: String Quartet No.2 - Nocturne
  };

  const sceneLabels = {
    hall:     '巴赫《哥德堡变奏曲》',
    test:     '格里格《晨曲》',
    corridor: '海顿《云雀四重奏》第二乐章',
    scale:    '门德尔松《赫布里底序曲》',
    quantum:  '巴赫《哥德堡变奏曲》第25变奏',
    imaging:  '德沃夏克《美国四重奏》第二乐章',
    light:    '门德尔松《苏格兰交响曲》第二乐章',
    time:     '博罗丁《夜曲》'
  };

  let audioEl = null;
  let button  = null;
  let hintEl  = null;
  let playing = false;
  let loading = false;
  let hintDismissed = false;
  let fadeInterval = null;
  let hintTimer = null;
  let dragState = null;
  let sceneKey = '';
  let suppressClick = false;
  const storagePrefix = 'ambientAudioDock:v4:';
  const dockGap = 10;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function syncHintPosition() {
    if (!button || !hintEl) return;
    const buttonRect = button.getBoundingClientRect();
    const buttonLeft = Number.isFinite(parseFloat(button.style.left)) ? parseFloat(button.style.left) : buttonRect.left;
    const buttonTop = Number.isFinite(parseFloat(button.style.top)) ? parseFloat(button.style.top) : buttonRect.top;
    const buttonWidth = button.offsetWidth || buttonRect.width || 34;
    const buttonHeight = button.offsetHeight || buttonRect.height || 34;
    const hintWidth = hintEl.offsetWidth || 120;
    const rightDocked = buttonLeft > window.innerWidth / 2;
    const rawLeft = rightDocked
      ? buttonLeft - hintWidth - dockGap
      : buttonLeft + buttonWidth + dockGap;
    const left = clamp(rawLeft, 10, window.innerWidth - hintWidth - 10);
    const top = clamp(buttonTop + (buttonHeight - 32) / 2, 12, window.innerHeight - 44);
    hintEl.style.left = `${left}px`;
    hintEl.style.top = `${top}px`;
  }

  function persistDockPosition() {
    if (!button || !sceneKey) return;
    const left = parseFloat(button.style.left || '0');
    const top = parseFloat(button.style.top || '0');
    localStorage.setItem(`${storagePrefix}${sceneKey}`, JSON.stringify({ left, top }));
  }

  function placeDock(left, top) {
    if (!button) return;
    const width = button.offsetWidth || 34;
    const height = button.offsetHeight || 34;
    const hintWidth = hintEl?.offsetWidth || 138;
    const groupWidth = width + dockGap + hintWidth;
    const groupedRightSide = left + width / 2 > window.innerWidth / 2;
    const minLeft = groupedRightSide ? groupWidth - width + 10 : 10;
    const maxLeft = groupedRightSide ? window.innerWidth - width - 10 : window.innerWidth - groupWidth - 10;
    const clampedLeft = clamp(left, minLeft, Math.max(minLeft, maxLeft));
    const clampedTop = clamp(top, 10, window.innerHeight - height - 10);
    button.style.left = `${clampedLeft}px`;
    button.style.top = `${clampedTop}px`;
    button.style.right = 'auto';
    syncHintPosition();
  }

  function snapDock() {
    if (!button) return;
    const width = button.offsetWidth || 34;
    const hintWidth = hintEl?.offsetWidth || 138;
    const rect = button.getBoundingClientRect();
    const margin = window.innerWidth <= 760 ? 18 : 26;
    const centerX = rect.left + rect.width / 2;
    const left = centerX < window.innerWidth / 2
      ? margin
      : window.innerWidth - width - margin;
    const adjustedLeft = centerX < window.innerWidth / 2
      ? left
      : Math.max(hintWidth + dockGap + margin, left);
    placeDock(adjustedLeft, rect.top);
    persistDockPosition();
  }

  function defaultDockPosition() {
    const mobile = window.innerWidth <= 760;
    const width = button?.offsetWidth || (mobile ? 32 : 34);
    const hintWidth = hintEl?.offsetWidth || (mobile ? 146 : 172);
    return mobile
      ? { left: window.innerWidth - width - 18, top: 190 }
      : { left: Math.max(hintWidth + dockGap + 26, Math.min(Math.max(window.innerWidth * 0.17, 178), 268)), top: 27 };
  }

  function restoreDockPosition() {
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(`${storagePrefix}${sceneKey}`) || 'null');
    } catch {}
    const fallback = defaultDockPosition();
    placeDock(stored?.left ?? fallback.left, stored?.top ?? fallback.top);
    if (!stored) persistDockPosition();
  }

  function startDrag(event) {
    if (!button || event.button > 0) return;
    const rect = button.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false
    };
    button.classList.add('is-dragging');
    button.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const distance = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
    dragState.moved = dragState.moved || distance > 4;
    placeDock(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
  }

  function endDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    button.releasePointerCapture?.(event.pointerId);
    button.classList.remove('is-dragging');
    const moved = dragState.moved;
    dragState = null;
    snapDock();
    if (moved) {
      suppressClick = true;
      setTimeout(() => {
        suppressClick = false;
      }, 0);
    }
  }

  function showHint(text, durationMs = 3600) {
    if (!hintEl || hintDismissed) return;
    if (hintTimer) clearTimeout(hintTimer);
    if (text) hintEl.textContent = text;
    hintEl.classList.add('is-visible');
    hintTimer = setTimeout(() => {
      if (!hintDismissed && hintEl) hintEl.classList.remove('is-visible');
    }, durationMs);
  }

  function dismissHint() {
    if (!hintEl || hintDismissed) return;
    hintDismissed = true;
    if (hintTimer) clearTimeout(hintTimer);
    hintEl.classList.remove('is-visible');
    setTimeout(() => {
      if (hintEl && hintEl.parentNode) hintEl.parentNode.removeChild(hintEl);
    }, 700);
  }

  // ── Audio helpers ──
  function audioFadeTo(targetVol, durationMs, callback) {
    if (fadeInterval) clearInterval(fadeInterval);
    const startVol = audioEl.volume;
    const steps    = Math.ceil(durationMs / 30);
    const delta    = (targetVol - startVol) / steps;
    let   step     = 0;
    fadeInterval   = setInterval(() => {
      step++;
      audioEl.volume = Math.max(0, Math.min(1, startVol + delta * step));
      if (step >= steps) {
        clearInterval(fadeInterval);
        fadeInterval = null;
        audioEl.volume = targetVol;
        if (callback) callback();
      }
    }, 30);
  }

  function setPlaying(next) {
    if (loading) return;

    if (playing) {
      playing = false;
      loading = false;
      button.classList.remove('is-playing', 'is-loading');
      button.classList.add('is-muted');
      button.setAttribute('aria-label', '播放背景音乐');
      showHint('已暂停', 2200);
      audioFadeTo(0, 600, () => {
        audioEl.pause();
        audioEl.volume = 0.68;
      });
      return;
    }

    if (next) {
      loading = true;
      button.classList.remove('is-muted', 'is-playing');
      button.classList.add('is-loading');
      button.setAttribute('aria-label', '正在加载背景音乐');
      showHint('正在加载音乐', 2600);
      // Ensure loaded, then play with fade-in
      if (audioEl.readyState < 2) {
        audioEl.load();
      }
      audioEl.volume = 0;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            playing = true;
            loading = false;
            button.classList.remove('is-loading', 'is-muted');
            button.classList.add('is-playing');
            button.setAttribute('aria-label', '暂停背景音乐');
            showHint('正在播放', 2600);
            audioFadeTo(0.68, 1200);
          })
          .catch((err) => {
            console.warn('[ambient-audio] play() blocked:', err.message);
            playing = false;
            loading = false;
            button.classList.remove('is-playing', 'is-loading');
            button.classList.add('is-muted');
            button.setAttribute('aria-label', '播放背景音乐');
            showHint('播放被浏览器拦截，请再点一次', 4200);
          });
      }
    }
  }

  function boot() {
    const key = document.body.dataset.ambientScene;
    if (!key || key === 'entrance') return;
    sceneKey = key;

    const src = musicFiles[key];
    if (!src) return;

    // Audio element
    audioEl      = new Audio();
    audioEl.src  = src;
    audioEl.loop = true;
    audioEl.volume = 0.68;
    audioEl.preload = 'none';

    // Disc button
    button = document.createElement('button');
    button.className  = 'ambient-audio is-muted';
    button.type       = 'button';
    button.setAttribute('aria-label', '播放背景音乐');
    button.setAttribute('title', sceneLabels[key] || '背景音乐');
    button.innerHTML  = '<span class="ambient-needle" aria-hidden="true"></span>';
    document.body.appendChild(button);

    // Hint element
    hintEl = document.createElement('div');
    hintEl.className  = 'ambient-hint is-visible';
    hintEl.textContent = `♩ ${sceneLabels[key] || '背景音乐'}`;
    document.body.appendChild(hintEl);

    button.addEventListener('click', (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      setPlaying(!playing);
    });
    button.addEventListener('mouseenter', () => showHint(sceneLabels[key] || '背景音乐', 2200));
    button.addEventListener('focus', () => showHint(sceneLabels[key] || '背景音乐', 2200));
    button.addEventListener('pointerdown', startDrag);
    button.addEventListener('pointermove', moveDrag);
    button.addEventListener('pointerup', endDrag);
    button.addEventListener('pointercancel', endDrag);
    hintEl.addEventListener('pointerdown', startDrag);
    hintEl.addEventListener('pointermove', moveDrag);
    hintEl.addEventListener('pointerup', endDrag);
    hintEl.addEventListener('pointercancel', endDrag);

    restoreDockPosition();
    syncHintPosition();

    // Pause when tab goes to background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && playing) setPlaying(false);
    });
    window.addEventListener('resize', () => {
      restoreDockPosition();
      syncHintPosition();
    });

    setTimeout(() => {
      document.body.classList.add('ambient-ready');
      if (hintTimer) clearTimeout(hintTimer);
      hintTimer = setTimeout(() => {
        if (!hintDismissed && hintEl) hintEl.classList.remove('is-visible');
      }, 30000);
    }, 720);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
