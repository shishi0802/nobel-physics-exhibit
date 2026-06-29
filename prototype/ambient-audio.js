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

  function startHintPulse(label) {
    setTimeout(() => showHint(`♩ ${label}`, 5600), 760);
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
    playing = next;
    button.classList.toggle('is-playing', playing);
    button.classList.toggle('is-muted', !playing);
    button.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');

    if (playing) {
      showHint('正在播放', 1800);
      // Ensure loaded, then play with fade-in
      if (audioEl.readyState < 2) {
        audioEl.load();
      }
      audioEl.volume = 0;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => audioFadeTo(0.68, 1200))
          .catch((err) => {
            console.warn('[ambient-audio] play() blocked:', err.message);
            playing = false;
            button.classList.remove('is-playing');
            button.classList.add('is-muted');
            showHint('浏览器阻止播放，请再点一次', 3000);
          });
      }
    } else {
      showHint('已暂停', 1600);
      // Fade out then pause
      audioFadeTo(0, 600, () => {
        audioEl.pause();
        audioEl.volume = 0.68;
      });
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
    hintEl.className  = 'ambient-hint';
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
    }, 720);

    startHintPulse(sceneLabels[key] || '背景音乐');
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
