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
    corridor: '海顿《云雀》慢板',
    scale:    '门德尔松《赫布里底序曲》',
    quantum:  '巴赫·第25变奏',
    imaging:  '德沃夏克《美国》慢板',
    light:    '门德尔松《苏格兰》慢板',
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

    button.addEventListener('click', () => setPlaying(!playing));
    button.addEventListener('mouseenter', () => showHint(sceneLabels[key] || '背景音乐', 2200));
    button.addEventListener('focus', () => showHint(sceneLabels[key] || '背景音乐', 2200));

    // Pause when tab goes to background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && playing) setPlaying(false);
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
