(function () {
  // Music track assignments (local MP3 files, CC0/public domain via Musopen/Internet Archive)
  const musicFiles = {
    hall:     "./assets/music/hall.mp3",      // Bach: Goldberg Variations - Aria
    test:     "./assets/music/test.mp3",      // Grieg: Morning Mood (Peer Gynt)
    corridor: "./assets/music/corridor.mp3",  // Haydn: String Quartet Lark - Adagio Cantabile
    scale:    "./assets/music/scale.mp3",     // Mendelssohn: Hebrides Overture
    quantum:  "./assets/music/quantum.mp3",   // Bach: Goldberg Variation 25
    imaging:  "./assets/music/imaging.mp3",   // Dvorak: American Quartet - Lento
    light:    "./assets/music/light.mp3",     // Mendelssohn: Scottish Symphony - Adagio
    time:     "./assets/music/time.mp3"       // Borodin: String Quartet No.2 - Nocturne
  };

  const sceneLabels = {
    hall: "大厅 · 巴赫《哥德堡变奏曲》",
    test: "测试厅 · 格里格《晨曲》",
    corridor: "走廊 · 海顿《云雀》慢板",
    scale: "尺度 · 门德尔松《赫布里底序曲》",
    quantum: "量子 · 巴赫《哥德堡变奏曲》第25变奏",
    imaging: "成像 · 德沃夏克《美国》弦乐四重奏慢板",
    light: "光学 · 门德尔松《苏格兰交响曲》慢板",
    time: "时间 · 博罗丁《夜曲》"
  };

  let audio = null;   // HTMLAudioElement
  let button = null;
  let hintEl = null;
  let playing = false;
  let hintTimer = null;

  function createButton(key) {
    const btn = document.createElement("button");
    btn.className = "ambient-audio is-muted";
    btn.type = "button";
    btn.setAttribute("aria-label", "播放背景音乐");
    btn.setAttribute("title", sceneLabels[key] || "背景音乐");
    btn.innerHTML = '<span class="ambient-needle" aria-hidden="true"></span>';
    document.body.appendChild(btn);
    return btn;
  }

  function createHint(key) {
    const el = document.createElement("div");
    el.className = "ambient-hint";
    el.textContent = "♩ 点击播放背景音乐";
    document.body.appendChild(el);
    // Auto-fade after 5s
    hintTimer = setTimeout(() => {
      el.classList.add("is-faded");
    }, 5000);
    return el;
  }

  function setPlaying(next) {
    if (!audio) return;
    if (next) {
      audio.play().catch(() => {});
    } else {
      // Smooth fade out then pause
      let vol = audio.volume;
      const fade = setInterval(() => {
        vol = Math.max(0, vol - 0.05);
        audio.volume = vol;
        if (vol <= 0) {
          clearInterval(fade);
          audio.pause();
          audio.volume = 0.72;
        }
      }, 40);
    }
    playing = next;
    button.classList.toggle("is-playing", playing);
    button.classList.toggle("is-muted", !playing);
    button.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");

    // Hide hint once user interacts
    if (hintEl && !hintEl.classList.contains("is-faded")) {
      clearTimeout(hintTimer);
      hintEl.classList.add("is-faded");
    }
  }

  function boot() {
    const key = document.body.dataset.ambientScene;
    if (!key || key === "entrance") return;

    const src = musicFiles[key];
    if (!src) return;

    // Create audio element
    audio = new Audio();
    audio.src = src;
    audio.loop = true;
    audio.volume = 0.72;
    audio.preload = "none";  // Don't auto-preload — save bandwidth

    button = createButton(key);
    hintEl = createHint(key);

    button.addEventListener("click", () => setPlaying(!playing));

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && playing) setPlaying(false);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
