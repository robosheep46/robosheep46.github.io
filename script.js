document.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  const ring = document.createElement("span");
  ring.className = "click-ripple";
  ring.style.left = event.clientX + "px";
  ring.style.top = event.clientY + "px";
  document.body.appendChild(ring);
  ring.addEventListener("animationend", () => ring.remove());
});

const immersivePage = document.querySelector(".immersive-page");

if (immersivePage) {
  const backdrop = document.createElement("div");
  backdrop.className = "inner-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 4; index += 1) {
    backdrop.append(document.createElement("span"));
  }
  document.body.prepend(backdrop);
}

(() => {
  const boot = document.querySelector(".boot");
  if (!boot) return;
  const fill = boot.querySelector(".boot-bar span");
  const scopedImages = document.querySelectorAll(".hero img, .story img");
  const images = [...(scopedImages.length ? scopedImages : document.images)];
  let total = images.length;
  let done = images.filter((img) => img.complete).length;
  let closed = false;

  const paint = () => {
    const ratio = total === 0 ? 1 : done / total;
    fill.style.transform = "scaleX(" + ratio + ")";
    boot.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    if (!closed && done >= total) {
      closed = true;
      boot.classList.add("is-done");
      window.setTimeout(() => boot.remove(), 480);
    }
  };

  const mark = () => {
    done += 1;
    paint();
  };

  window.setTimeout(() => {
    if (closed) return;
    closed = true;
    boot.classList.add("is-done");
    window.setTimeout(() => boot.remove(), 480);
  }, 5000);

  images.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", mark, { once: true });
    img.addEventListener("error", mark, { once: true });
  });

  const background = getComputedStyle(document.body, "::before").backgroundImage || "";
  const source = background.match(/url\((['"]?)(.*?)\1\)/);
  if (source && source[2] && source[2] !== "none") {
    total += 1;
    let noted = false;
    const once = () => {
      if (noted) return;
      noted = true;
      mark();
    };
    const probe = new Image();
    probe.addEventListener("load", once, { once: true });
    probe.addEventListener("error", once, { once: true });
    probe.src = source[2];
    if (probe.complete) once();
  }

  paint();
})();

(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const overlay = document.createElement("div");
  overlay.className = "route-transition";
  overlay.setAttribute("aria-hidden", "true");
  document.body.append(overlay);

  if (!reduced && !document.querySelector(".boot")) {
    overlay.classList.add("is-covering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.remove("is-covering"));
    });
  }

  const leave = (href) => {
    if (reduced) {
      location.href = href;
      return;
    }
    document.body.classList.add("is-route-leaving");
    overlay.classList.add("is-covering");
    window.setTimeout(() => {
      location.href = href;
    }, 430);
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const url = new URL(link.href, location.href);
    const samePageHash =
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.search === location.search &&
      Boolean(url.hash);
    if (samePageHash || url.origin !== location.origin) return;
    if (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "file:") return;

    event.preventDefault();
    leave(url.href);
  });

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-route-leaving");
    overlay.classList.remove("is-covering");
  });
})();

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");

if (navToggle && siteNav) {
  const closeNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.title = "打开导航";
    siteNav.classList.remove("is-open");
  };

  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", open ? "false" : "true");
    navToggle.title = open ? "打开导航" : "关闭导航";
    siteNav.classList.toggle("is-open", !open);
  });

  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

const homeTopbar = document.querySelector(".home-page .topbar");
const homeHero = document.querySelector(".home-page .hero");

if (homeTopbar && homeHero) {
  const syncTopbarTone = () => {
    homeTopbar.classList.toggle("is-paper", window.scrollY >= homeHero.offsetHeight - 72);
  };
  syncTopbarTone();
  window.addEventListener("scroll", syncTopbarTone, { passive: true });
  window.addEventListener("resize", syncTopbarTone);
}

const paperTopbar = document.querySelector(".paper-page .topbar-paper");

if (paperTopbar) {
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const immersive = document.body.classList.contains("immersive-page");
  const syncPaperTopbar = () => {
    const reading = window.scrollY >= (window.innerWidth <= 700 ? 240 : 340);
    paperTopbar.classList.toggle("is-reading", reading);
    if (themeMeta) themeMeta.content = immersive ? "#07101c" : (reading ? "#f2f2ee" : "#07101c");
  };
  syncPaperTopbar();
  window.addEventListener("scroll", syncPaperTopbar, { passive: true });
  window.addEventListener("resize", syncPaperTopbar);
}

const homeHub = document.querySelector(".home-hub");

if (homeHub) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && "IntersectionObserver" in window) {
    homeHub.classList.add("is-motion-ready");
    const revealHub = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      homeHub.classList.add("is-visible");
      revealHub.disconnect();
    }, { threshold: 0.12 });
    revealHub.observe(homeHub);
  } else {
    homeHub.classList.add("is-visible");
  }
}

const homePage = document.querySelector(".home-page");
const themeToggle = document.querySelector("[data-theme-toggle]");

const immersiveTopbar = document.querySelector(".immersive-page .topbar");

if (immersiveTopbar && !document.querySelector("[data-audio-toggle]")) {
  const scriptUrl = document.currentScript?.src || new URL("../script.js", document.baseURI).href;
  const audioSource = new URL("./media/kokoronashi-shuangsheng.mp3", scriptUrl).href;
  const topbarLink = immersiveTopbar.querySelector(".top-link");
  const actions = document.createElement("div");
  const button = document.createElement("button");
  const audio = document.createElement("audio");

  actions.className = "topbar-actions";
  button.className = "inner-music";
  button.type = "button";
  button.dataset.audioToggle = "";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", "播放《心做し》");
  button.title = "播放《心做し》";
  button.innerHTML = '<span class="music-play" aria-hidden="true"></span>';

  audio.dataset.siteAudio = "";
  audio.preload = "none";
  audio.src = audioSource;

  actions.append(button);
  if (topbarLink) actions.append(topbarLink);
  immersiveTopbar.append(actions);
  document.body.append(audio);
}

const audioToggle = document.querySelector("[data-audio-toggle]");
const siteAudio = document.querySelector("[data-home-audio], [data-site-audio]");

if (audioToggle && siteAudio) {
  const storageKey = "robosheep-audio-state";
  let lastStoredAt = 0;

  const readAudioState = () => {
    try {
      const state = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (!state || !Number.isFinite(state.currentTime)) return null;
      return state;
    } catch (error) {
      return null;
    }
  };

  const savedState = readAudioState();
  let hasAudioState = Boolean(savedState);

  const storeAudioState = (force = false) => {
    if (!hasAudioState && siteAudio.paused && siteAudio.currentTime === 0) return;
    const now = Date.now();
    if (!force && now - lastStoredAt < 800) return;
    lastStoredAt = now;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        currentTime: Number.isFinite(siteAudio.currentTime) ? siteAudio.currentTime : 0,
        playing: !siteAudio.paused && !siteAudio.ended,
        savedAt: now
      }));
    } catch (error) {
      // Playback still works when session storage is unavailable.
    }
  };

  const syncAudioState = () => {
    const playing = !siteAudio.paused && !siteAudio.ended;
    audioToggle.classList.toggle("is-playing", playing);
    audioToggle.setAttribute("aria-pressed", playing ? "true" : "false");
    audioToggle.setAttribute("aria-label", `${playing ? "暂停" : "播放"}《心做し》`);
    audioToggle.title = `${playing ? "暂停" : "播放"}《心做し》`;
  };

  audioToggle.addEventListener("click", async () => {
    if (!siteAudio.paused) {
      siteAudio.pause();
      return;
    }
    try {
      await siteAudio.play();
    } catch (error) {
      syncAudioState();
    }
  });

  siteAudio.addEventListener("play", () => {
    hasAudioState = true;
    syncAudioState();
    storeAudioState(true);
  });
  siteAudio.addEventListener("pause", () => {
    syncAudioState();
    storeAudioState(true);
  });
  siteAudio.addEventListener("timeupdate", () => storeAudioState());
  siteAudio.addEventListener("ended", () => {
    siteAudio.currentTime = 0;
    syncAudioState();
    storeAudioState(true);
  });
  window.addEventListener("pagehide", () => storeAudioState(true));

  if (savedState) {
    const restoreAudio = async () => {
      const elapsed = savedState.playing
        ? Math.min(10, Math.max(0, (Date.now() - (savedState.savedAt || Date.now())) / 1000))
        : 0;
      const resumeAt = savedState.currentTime + elapsed;
      const lastPlayableSecond = Number.isFinite(siteAudio.duration)
        ? Math.max(0, siteAudio.duration - 0.25)
        : resumeAt;
      siteAudio.currentTime = Math.min(resumeAt, lastPlayableSecond);
      if (!savedState.playing) {
        syncAudioState();
        return;
      }
      try {
        await siteAudio.play();
      } catch (error) {
        syncAudioState();
        storeAudioState(true);
      }
    };

    if (siteAudio.readyState >= 1) {
      restoreAudio();
    } else {
      siteAudio.addEventListener("loadedmetadata", restoreAudio, { once: true });
      siteAudio.preload = "metadata";
      siteAudio.load();
    }
  }

  syncAudioState();
}

if (homePage && themeToggle) {
  const storageKey = "robosheep-home-theme";
  let savedTheme = "night";
  try {
    savedTheme = localStorage.getItem(storageKey) || "night";
  } catch (error) {
    savedTheme = "night";
  }

  const applyTheme = (theme) => {
    const day = theme === "day";
    homePage.classList.toggle("is-day", day);
    themeToggle.setAttribute("aria-pressed", day ? "true" : "false");
    themeToggle.setAttribute("aria-label", day ? "切换夜间模式" : "切换日间模式");
    themeToggle.title = day ? "切换夜间模式" : "切换日间模式";
  };

  applyTheme(savedTheme);
  themeToggle.addEventListener("click", () => {
    const theme = homePage.classList.contains("is-day") ? "night" : "day";
    applyTheme(theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // The visual mode still works when local storage is unavailable.
    }
  });
}

const clockTarget = document.querySelector("[data-live-clock]");
const dateTarget = document.querySelector("[data-live-date]");

if (clockTarget && dateTarget) {
  const padTime = (value) => String(value).padStart(2, "0");
  const updateClock = () => {
    const now = new Date();
    clockTarget.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()].map(padTime).join(":");
    dateTarget.textContent = [now.getFullYear(), padTime(now.getMonth() + 1), padTime(now.getDate())].join(".");
    clockTarget.dateTime = now.toISOString();
  };
  updateClock();
  window.setInterval(updateClock, 1000);
}

document.querySelectorAll("[data-album]").forEach((album) => {
  const cards = [...album.querySelectorAll(".life-card")];
  const prev = album.querySelector(".album-prev");
  const next = album.querySelector(".album-next");
  const frame = album.querySelector(".album-frame");
  const commentPanels = [...album.querySelectorAll("[data-album-comment]")];
  if (!cards.length || !prev || !next || !frame) return;

  let index = Math.max(0, cards.findIndex((card) => card.classList.contains("is-on")));
  const show = (nextIndex) => {
    index = Math.max(0, Math.min(cards.length - 1, nextIndex));
    cards.forEach((card, i) => card.classList.toggle("is-on", i === index));
    commentPanels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
    prev.disabled = index === 0;
    next.disabled = index === cards.length - 1;
  };

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));

  let startX = 0;
  frame.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });
  frame.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - startX;
    if (distance > 40) show(index - 1);
    if (distance < -40) show(index + 1);
  }, { passive: true });

  show(index);
});

document.querySelectorAll("[data-page-swipe]").forEach((root) => {
  const prev = root.querySelector("a.album-prev");
  const next = root.querySelector("a.album-next");
  const go = (link) => {
    if (link && link.href) location.href = link.href;
  };
  let startX = 0;
  let startY = 0;
  let onAxis = false;
  root.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
    onAxis = Boolean(event.target.closest(".axis"));
  }, { passive: true });
  root.addEventListener("touchend", (event) => {
    if (onAxis || event.target.closest(".axis")) return;
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? next : prev);
  }, { passive: true });
});

document.querySelectorAll(".axis").forEach((axis) => {
  const root = axis.parentElement;
  const tabs = [...axis.querySelectorAll("[role='tab']")];
  const panels = [...root.querySelectorAll(":scope > .passage")];
  if (!tabs.length || !panels.length) return;

  const show = (id) => {
    tabs.forEach((tab) => {
      const on = tab.getAttribute("aria-controls") === id;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== id;
    });
  };

  const fromHash = panels.find((panel) => panel.id === location.hash.slice(1));
  show((fromHash || panels[0]).id);

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("aria-controls");
      show(id);
      history.replaceState(null, "", "#" + id);
      tab.scrollIntoView({ inline: "center", block: "nearest" });
    });

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next =
        event.key === "ArrowRight"
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });
});

const links = document.querySelectorAll('a[href^="#"]');

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});

document.querySelectorAll(".signal").forEach((signal) => {
  const button = signal.querySelector(".signal-toggle");
  const panel = signal.querySelector(".signal-panel");
  const label = button && button.querySelector(".signal-toggle-label");
  if (!button || !panel || !label) return;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", open ? "false" : "true");
    panel.hidden = open;
    label.textContent = open ? "展开" : "收起";
  });
});

const hero = document.querySelector(".hero");
const frame = document.querySelector(".hero-frame");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hero && frame && !reduceMotion) {
  let ticking = 0;
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const ease = (amount) =>
    amount < 0.5 ? 2 * amount * amount : 1 - ((-2 * amount + 2) ** 2) / 2;
  const heroCopy = hero.querySelector(".hero-copy");

  const focusOut = () => {
    const height = hero.offsetHeight || 1;
    const progress = Math.min(1, Math.max(0, window.scrollY / (height * 0.92)));
    const eased = ease(progress);
    frame.style.transform = `scale(${lerp(1, 1.09, eased)})`;
    frame.style.filter = `blur(${lerp(0, 16, eased)}px)`;
    frame.style.opacity = String(lerp(1, 0, Math.min(1, eased * 2)));
    const solidUntil = lerp(100, 54, eased);
    const fadeUntil = lerp(100, 88, eased);
    const mask = `linear-gradient(to bottom, #000 0%, #000 ${solidUntil}%, transparent ${fadeUntil}%, transparent 100%)`;
    frame.style.maskImage = mask;
    frame.style.webkitMaskImage = mask;
    if (heroCopy) {
      heroCopy.style.opacity = String(lerp(1, 0, Math.min(1, eased * 1.4)));
      heroCopy.style.transform = `translateY(${lerp(0, -18, eased)}px)`;
    }
  };

  const onScroll = () => {
    cancelAnimationFrame(ticking);
    ticking = requestAnimationFrame(focusOut);
  };

  focusOut();
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

const cards = document.querySelectorAll(".after-motto .shelf");
if (cards.length && !reduceMotion && "IntersectionObserver" in window) {
  let wave = 0;
  const rises = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.animationDelay = wave * 90 + "ms";
      wave += 1;
      entry.target.classList.add("is-in");
      rises.unobserve(entry.target);
    });
  }, { threshold: 0.22 });
  cards.forEach((card) => rises.observe(card));
}

document.querySelectorAll(".after-motto .shelf a").forEach((link) => {
  const card = link.closest(".shelf");
  if (!card) return;

  const pop = () => {
    card.classList.remove("is-duang");
    void card.offsetWidth;
    card.classList.add("is-duang");
  };

  link.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    pop();
  });

  link.addEventListener("click", (event) => {
    if (reduceMotion) return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!card.classList.contains("is-duang")) pop();
    let gone = false;
    const go = () => {
      if (gone) return;
      gone = true;
      window.location.href = link.href;
    };
    card.addEventListener("animationend", (end) => {
      if (end.animationName === "card-duang") go();
    });
    window.setTimeout(go, 520);
  });
});

const stage = document.querySelector(".hero-live");
if (stage && frame && !reduceMotion) {
  const pen = stage.getContext("2d");
  const ripples = [];
  const lights = [];
  let rippleIn = 1400;
  let lightIn = 600;
  const boot = document.querySelector(".boot");
  if (boot && !boot.classList.contains("is-done")) {
    rippleIn = 9000;
    lightIn = 9000;
    const watch = new MutationObserver(() => {
      if (!boot.classList.contains("is-done")) return;
      rippleIn = 1100;
      lightIn = 350;
      watch.disconnect();
    });
    watch.observe(boot, { attributes: true });
  }
  let last = 0;
  let playing = true;
  const rand = (min, max) => min + Math.random() * (max - min);

  const fit = () => {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    stage.width = Math.max(1, Math.round(width * dpr));
    stage.height = Math.max(1, Math.round(height * dpr));
    pen.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (dt) => {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    pen.clearRect(0, 0, width, height);
    rippleIn -= dt;
    lightIn -= dt;
    if (rippleIn <= 0 && ripples.length < 1) {
      ripples.push({
        x: rand(width * 0.12, width * 0.88),
        y: rand(height * 0.74, height * 0.92),
        max: rand(46, 96),
        age: 0,
        life: rand(2600, 3400)
      });
      rippleIn = rand(6200, 11000);
    }
    if (lightIn <= 0 && lights.length < 1) {
      const warm = Math.random() < 0.5;
      lights.push({
        x: rand(width * 0.2, width * 0.82),
        y: rand(height * 0.08, height * 0.4),
        radius: rand(120, 240),
        rgb: warm ? "255, 214, 160" : "176, 206, 255",
        age: 0,
        life: rand(3800, 5200)
      });
      lightIn = rand(7000, 13000);
    }

    for (let i = lights.length - 1; i >= 0; i -= 1) {
      const light = lights[i];
      light.age += dt;
      const t = light.age / light.life;
      if (t >= 1) {
        lights.splice(i, 1);
        continue;
      }
      const alpha = Math.sin(Math.PI * t) * 0.22;
      const glow = pen.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
      glow.addColorStop(0, `rgba(${light.rgb}, ${alpha})`);
      glow.addColorStop(0.45, `rgba(${light.rgb}, ${alpha * 0.35})`);
      glow.addColorStop(1, `rgba(${light.rgb}, 0)`);
      pen.fillStyle = glow;
      pen.beginPath();
      pen.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
      pen.fill();
    }

    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      const ripple = ripples[i];
      ripple.age += dt;
      const t = ripple.age / ripple.life;
      if (t >= 1) {
        ripples.splice(i, 1);
        continue;
      }
      const grow = 1 - (1 - t) ** 2;
      const fade = Math.sin(Math.PI * t) * 0.28;
      const rx = Math.max(1, ripple.max * grow);
      const ry = Math.max(1, rx * 0.22);
      pen.beginPath();
      pen.ellipse(ripple.x, ripple.y, rx, ry, 0, 0, Math.PI * 2);
      pen.strokeStyle = `rgba(255, 248, 236, ${fade})`;
      pen.lineWidth = 1;
      pen.stroke();
    }
  };

  const loop = (now) => {
    if (!playing) return;
    const dt = last ? Math.min(40, now - last) : 16;
    last = now;
    const box = hero.getBoundingClientRect();
    if (box.bottom > 0 && box.top < window.innerHeight) draw(dt);
    requestAnimationFrame(loop);
  };

  fit();
  window.addEventListener("resize", fit);
  document.addEventListener("visibilitychange", () => {
    playing = !document.hidden;
    if (playing) {
      last = 0;
      requestAnimationFrame(loop);
    }
  });
  requestAnimationFrame(loop);
}
