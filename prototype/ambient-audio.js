(function () {
  const scenes = {
    hall: {
      root: 65.41,
      intervals: [1, 1.5, 2, 2.5],
      color: "warm",
      pulse: .050,
      label: "大厅环境音乐"
    },
    test: {
      root: 82.41,
      intervals: [1, 1.25, 1.5, 2],
      color: "glass",
      pulse: .040,
      label: "人格测试环境音乐"
    },
    corridor: {
      root: 55.00,
      intervals: [1, 1.333, 1.5, 2],
      color: "amber",
      pulse: .034,
      label: "物理学家走廊环境音乐"
    },
    scale: {
      root: 41.20,
      intervals: [1, 2, 3, 4],
      color: "deep",
      pulse: .030,
      label: "尺度透镜环境音乐"
    },
    quantum: {
      root: 73.42,
      intervals: [1, 1.414, 1.618, 2],
      color: "cyan",
      pulse: .056,
      label: "量子展厅环境音乐"
    },
    imaging: {
      root: 61.74,
      intervals: [1, 1.2, 1.5, 1.875],
      color: "body",
      pulse: .046,
      label: "身体成像环境音乐"
    },
    light: {
      root: 98.00,
      intervals: [1, 1.125, 1.5, 2],
      color: "silver",
      pulse: .060,
      label: "光与微缩环境音乐"
    },
    time: {
      root: 49.00,
      intervals: [1, 1.5, 2, 3],
      color: "clock",
      pulse: .042,
      label: "时间与共振环境音乐"
    }
  };

  const colorProfiles = {
    warm: { filter: 1050, shimmer: 1480, noise: .010 },
    glass: { filter: 1240, shimmer: 1720, noise: .008 },
    amber: { filter: 920, shimmer: 1320, noise: .012 },
    deep: { filter: 560, shimmer: 1040, noise: .012 },
    cyan: { filter: 1380, shimmer: 1880, noise: .010 },
    body: { filter: 760, shimmer: 1160, noise: .014 },
    silver: { filter: 1520, shimmer: 2240, noise: .008 },
    clock: { filter: 680, shimmer: 980, noise: .011 }
  };

  let audio = null;
  let button = null;
  let started = false;
  let playing = false;

  function createButton(scene) {
    const btn = document.createElement("button");
    btn.className = "ambient-audio is-muted";
    btn.type = "button";
    btn.setAttribute("aria-label", `播放${scene.label}`);
    btn.setAttribute("title", "背景音乐");
    btn.innerHTML = '<span class="ambient-needle" aria-hidden="true"></span>';
    document.body.appendChild(btn);
    return btn;
  }

  function makeNoiseBuffer(ctx) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function connectDrone(ctx, destination, scene) {
    const profile = colorProfiles[scene.color] || colorProfiles.warm;
    const bus = ctx.createGain();
    bus.gain.value = 0.0001;
    bus.connect(destination);

    scene.intervals.forEach((interval, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      osc.type = index % 2 ? "triangle" : "sine";
      osc.frequency.value = scene.root * interval;
      gain.gain.value = 0.020 / (index + 1);
      pan.pan.value = [-.42, .36, -.16, .18][index] || 0;
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(bus);
      osc.start();
    });

    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = "sine";
    shimmer.frequency.value = profile.shimmer;
    shimmerGain.gain.value = 0.0028;
    shimmer.connect(shimmerGain);
    shimmerGain.connect(bus);
    shimmer.start();

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = scene.pulse;
    lfoGain.gain.value = 0.007;
    lfo.connect(lfoGain);
    lfoGain.connect(bus.gain);
    lfo.start();

    const noise = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = profile.filter;
    noiseFilter.Q.value = .4;
    noiseGain.gain.value = profile.noise;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(bus);
    noise.start();

    return bus;
  }

  function initAudio(scene) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;

    const ctx = new AudioContext();
    const master = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    master.gain.value = 0.0001;
    limiter.threshold.value = -34;
    limiter.knee.value = 18;
    limiter.ratio.value = 7;
    limiter.attack.value = .05;
    limiter.release.value = .6;
    master.connect(limiter);
    limiter.connect(ctx.destination);

    const drone = connectDrone(ctx, master, scene);
    return { ctx, master, drone };
  }

  function setPlaying(next, scene) {
    if (!audio) {
      audio = initAudio(scene);
      if (!audio) return;
    }

    audio.ctx.resume();
    const now = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setTargetAtTime(next ? 0.58 : 0.0001, now, next ? .42 : .24);
    playing = next;
    started = true;
    button.classList.toggle("is-playing", playing);
    button.classList.toggle("is-muted", !playing);
    button.setAttribute("aria-label", `${playing ? "暂停" : "播放"}${scene.label}`);
  }

  function boot() {
    const key = document.body.dataset.ambientScene;
    if (!key || key === "entrance") return;

    const scene = scenes[key] || scenes.hall;
    button = createButton(scene);
    button.addEventListener("click", () => setPlaying(!playing, scene));

    document.addEventListener("visibilitychange", () => {
      if (!audio || !started) return;
      if (document.hidden && playing) setPlaying(false, scene);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
