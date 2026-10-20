(() => {
  const store = window.contentStore;
  const client = store?.client;
  const builtInFiveCards = [...(window.ROBOSHEEP_GROWTH_CARDS || [])];
  const builtInTeamCards = [...(window.ROBOSHEEP_TEAM_CARDS || [])];
  const growthSeries = [...(window.ROBOSHEEP_GROWTH_SERIES || [])];
  const colors = [
    { key: "moon", label: "月光金" },
    { key: "mist", label: "雾霭蓝" },
    { key: "pine", label: "松针绿" },
    { key: "dusk", label: "暮色粉" },
    { key: "lilac", label: "淡紫灰" },
  ];
  const badges = [
    { days: 7, name: "点亮微光" },
    { days: 30, name: "向光生长" },
    { days: 100, name: "渐有光芒" },
    { days: 365, name: "温柔明亮" },
    { days: 1095, name: "光芒万丈" },
  ];

  const beijingParts = (date = new Date()) => Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  const today = () => {
    const parts = beijingParts();
    return `${parts.year}-${parts.month}-${parts.day}`;
  };
  const dateToUtc = (value) => new Date(`${value}T00:00:00Z`);
  const isoDate = (date) => date.toISOString().slice(0, 10);
  const randomIndex = (length) => {
    if (!length) return 0;
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % length;
  };
  const readValue = (key) => {
    try { return localStorage.getItem(key) || ""; }
    catch (error) { return ""; }
  };
  const writeValue = (key, value) => {
    try { localStorage.setItem(key, value); }
    catch (error) { /* The result still remains visible for this page view. */ }
  };
  const assetUrl = (value) => {
    if (!value) return "";
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    return new URL(value.replace(/^\//, "../"), window.location.href).href;
  };
  const normalizeCard = (card) => ({
    id: card.id || "",
    slug: card.slug || "",
    category: card.category || card.pool || "five-piece",
    pool: card.pool || card.category || "five-piece",
    name: card.person_name || card.name || "",
    school: card.school_name || card.school || "",
    title: card.title || card.collection_title || "",
    quote: card.quote || "",
    source: card.source_label || card.source || "",
    sourceUrl: card.source_url || card.sourceUrl || "",
    imageUrl: card.image_url || card.imageUrl || "",
    seriesKey: card.collection_key || card.seriesKey || "",
    seriesTitle: card.collection_title || card.seriesTitle || card.title || "",
    pieceIndex: Number(card.piece_index || card.pieceIndex || 0),
    pieceCount: Number(card.piece_count || card.pieceCount || 0),
    fullImageUrl: card.full_image_url || card.fullImageUrl || "",
    sortOrder: Number(card.sort_order ?? card.sortOrder ?? 0),
    savedId: card.saved_id || card.savedId || "",
    savedYear: Number(card.saved_year || card.savedYear || 0),
    savedAt: card.saved_at || card.savedAt || "",
    drawDate: card.draw_date || card.drawDate || "",
    earnedColor: card.earned_color || card.earnedColor || "",
  });

  const initHomeMiniWall = () => {
    const mini = document.querySelector("[data-growth-mini]");
    if (!mini) return;
    const heart = [
      "001110000111000",
      "011111001111100",
      "111111111111110",
      "111111111111110",
      "011111111111100",
      "001111111111000",
      "000111111110000",
      "000011111100000",
      "000001110000000",
    ];
    const palette = colors.map((color) => color.key);
    const cells = heart.flatMap((row, rowIndex) => [...row].map((value, columnIndex) => {
      const cell = document.createElement("i");
      if (value === "1") {
        cell.className = `is-heart is-${palette[(rowIndex * 2 + columnIndex) % palette.length]}`;
      }
      return cell;
    }));
    mini.replaceChildren(...cells);
  };

  const root = document.querySelector(".growth-page");
  if (!root) {
    initHomeMiniWall();
    return;
  }

  const yearSelect = document.querySelector("[data-growth-year]");
  const savedYearSelect = document.querySelector("[data-saved-year]");
  const calendar = document.querySelector("[data-growth-calendar]");
  const savedRoot = document.querySelector("[data-saved-cards]");
  const collectionRoot = document.querySelector("[data-five-piece-collections]");
  const drawMessage = document.querySelector("[data-draw-message]");
  const adminSave = document.querySelector("[data-draw-admin]");
  const rewardColors = document.querySelector("[data-reward-colors]");
  const saveDrawnButton = document.querySelector("[data-save-drawn-card]");
  const drawResultDialog = document.querySelector("[data-draw-result-dialog]");
  const drawResultMedia = document.querySelector("[data-draw-result-media]");
  const drawResultImage = document.querySelector("[data-draw-result-image]");
  const drawResultLoading = document.querySelector("[data-draw-result-loading]");
  const fullArtDialog = document.querySelector("[data-full-art-dialog]");
  const pools = new Map([["five-piece", []], ["robomaster", []]]);
  const currentDraws = new Map();
  const drawingPools = new Set();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let growthDays = [];
  let savedCards = [];
  let admin = false;
  let rewardStatus = [];
  let selectedRewardColor = "";
  let selectedPool = "";
  let todaySavedCard = null;

  const fillYearOptions = (select, years) => {
    const current = Number(beijingParts().year);
    const previous = Number(select.value || current);
    select.replaceChildren(...years.map((year) => {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = `${year} 年`;
      option.selected = year === previous;
      return option;
    }));
    if (![...years].includes(previous)) select.value = String(current);
  };

  const calculateStreaks = (days) => {
    const active = new Set(days.map((day) => day.record_date));
    let best = 0;
    let run = 0;
    [...active].sort().forEach((value, index, ordered) => {
      const previous = index ? dateToUtc(ordered[index - 1]) : null;
      const current = dateToUtc(value);
      run = previous && (current - previous === 86400000) ? run + 1 : 1;
      best = Math.max(best, run);
    });
    let currentRun = 0;
    const cursor = dateToUtc(today());
    if (!active.has(isoDate(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
    while (active.has(isoDate(cursor))) {
      currentRun += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return { current: currentRun, best };
  };

  const renderCalendar = () => {
    const year = Number(yearSelect.value);
    const byDate = new Map(growthDays.filter((day) => Number(day.record_date.slice(0, 4)) === year).map((day) => [day.record_date, day]));
    const first = new Date(Date.UTC(year, 0, 1));
    const last = new Date(Date.UTC(year, 11, 31));
    const blanks = (first.getUTCDay() + 6) % 7;
    const nodes = [];
    for (let index = 0; index < blanks; index += 1) {
      const blank = document.createElement("i");
      blank.className = "is-blank";
      blank.setAttribute("aria-hidden", "true");
      nodes.push(blank);
    }
    for (let cursor = new Date(first); cursor <= last; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const date = isoDate(cursor);
      const day = byDate.get(date);
      const cell = document.createElement("i");
      const label = colors.find((color) => color.key === day?.color)?.label || "微光";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", day ? `${date}，已点亮，${label}` : `${date}，未点亮`);
      cell.title = day ? `${date} · ${label}` : date;
      if (day) cell.className = `is-${day.color}`;
      nodes.push(cell);
    }
    calendar.replaceChildren(...nodes);
    const yearDays = [...byDate.values()];
    const streaks = calculateStreaks(yearDays);
    document.querySelector("[data-growth-lit-count]").textContent = String(yearDays.length);
    document.querySelector("[data-growth-current-streak]").textContent = String(year === Number(beijingParts().year) ? streaks.current : 0);
    document.querySelector("[data-growth-best-streak]").textContent = String(streaks.best);
  };

  const renderBadges = () => {
    const total = growthDays.length;
    document.querySelector("[data-growth-total]").textContent = `累计点亮 ${total} 天`;
    const nextBadge = badges.find((badge) => total < badge.days);
    const currentBadge = [...badges].reverse().find((badge) => total >= badge.days);
    const target = nextBadge || currentBadge || badges[0];
    const previousDays = currentBadge?.days || 0;
    const stageSpan = Math.max(1, target.days - previousDays);
    const stageProgress = nextBadge ? Math.max(0, total - previousDays) : stageSpan;
    const progressPercent = Math.min(100, Math.round((stageProgress / stageSpan) * 100));

    const article = document.createElement("article");
    article.className = nextBadge ? "growth-milestone" : "growth-milestone is-unlocked";

    const mark = document.createElement("span");
    mark.className = "growth-milestone-mark";
    mark.textContent = nextBadge ? String(target.days) : "光";

    const copy = document.createElement("div");
    copy.className = "growth-milestone-copy";
    const eyebrow = document.createElement("span");
    eyebrow.textContent = nextBadge ? "下一阶段" : "当前阶段";
    const title = document.createElement("h3");
    title.textContent = target.name;
    const progress = document.createElement("p");
    progress.textContent = nextBadge
      ? `距离这个阶段还差 ${target.days - total} 天`
      : `已经抵达 ${target.days} 天`;
    copy.append(eyebrow, title, progress);

    const meter = document.createElement("div");
    meter.className = "growth-milestone-meter";
    const meterLabel = document.createElement("span");
    meterLabel.textContent = nextBadge ? `${total} / ${target.days} 天` : `${target.days} 天达成`;
    const track = document.createElement("div");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", `距离${target.name}的进度`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(stageSpan));
    track.setAttribute("aria-valuenow", String(stageProgress));
    const fill = document.createElement("i");
    fill.style.width = `${progressPercent}%`;
    track.append(fill);
    meter.append(meterLabel, track);

    article.append(mark, copy, meter);
    document.querySelector("[data-growth-badges]").replaceChildren(article);
  };

  const createSavedCard = (card) => {
    const figure = document.createElement("figure");
    figure.className = `saved-growth-card is-${card.category}`;
    const img = document.createElement("img");
    img.src = assetUrl(card.imageUrl);
    img.alt = `${card.seriesTitle || card.title}中的${card.name}卡片`;
    img.loading = "lazy";
    const caption = document.createElement("figcaption");
    const title = document.createElement("strong");
    title.textContent = card.name;
    const detail = document.createElement("span");
    const date = card.drawDate || card.savedAt?.slice(0, 10) || "";
    detail.textContent = `${card.seriesTitle || card.title}${date ? ` · ${date}` : ""}`;
    caption.append(title, detail);
    figure.append(img, caption);
    return figure;
  };

  const renderSavedCards = () => {
    const year = Number(savedYearSelect.value);
    const cards = savedCards.filter((card) => card.savedYear === year);
    if (!cards.length) {
      savedRoot.innerHTML = '<p class="growth-empty">这一年还没有收藏卡片。</p>';
      return;
    }
    savedRoot.replaceChildren(...cards.map(createSavedCard));
  };

  const openFullArt = (seriesTitle, imageUrl) => {
    document.querySelector("[data-full-art-title]").textContent = seriesTitle;
    const image = document.querySelector("[data-full-art-image]");
    image.src = assetUrl(imageUrl);
    image.alt = `${seriesTitle}五联卡完整画面`;
    fullArtDialog.showModal();
  };

  const renderCollections = () => {
    const savedFive = savedCards.filter((card) => card.category === "five-piece");
    const savedBySlug = new Map(savedFive.map((card) => [card.slug, card]));
    let completed = 0;
    const groups = growthSeries.map((series) => {
      const cards = builtInFiveCards.filter((card) => card.seriesKey === series.key).sort((a, b) => a.pieceIndex - b.pieceIndex);
      const collected = cards.filter((card) => savedBySlug.has(card.slug));
      const complete = collected.length === cards.length && cards.length > 0;
      if (complete) completed += 1;
      const section = document.createElement("section");
      section.className = `five-piece-series${complete ? " is-complete" : ""}`;
      const header = document.createElement("header");
      const heading = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = series.title;
      const progress = document.createElement("span");
      progress.textContent = `${collected.length} / ${cards.length}`;
      heading.append(title, progress);
      const state = document.createElement("p");
      state.textContent = complete ? "整画已解锁" : `还差 ${cards.length - collected.length} 张`;
      header.append(heading, state);

      const strip = document.createElement("div");
      strip.className = "five-piece-strip";
      cards.forEach((rawCard) => {
        const card = normalizeCard(rawCard);
        const saved = savedBySlug.get(card.slug);
        const slot = document.createElement("figure");
        slot.className = saved ? "is-collected" : "is-locked";
        if (saved) {
          const img = document.createElement("img");
          img.src = assetUrl(card.imageUrl);
          img.alt = `${series.title}第 ${card.pieceIndex} 张，${card.name}`;
          img.loading = "lazy";
          slot.append(img);
        } else {
          const lock = document.createElement("span");
          lock.textContent = String(card.pieceIndex).padStart(2, "0");
          slot.append(lock);
        }
        const caption = document.createElement("figcaption");
        caption.textContent = saved ? card.name : "待收集";
        slot.append(caption);
        strip.append(slot);
      });
      section.append(header, strip);
      if (complete) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "view-full-art";
        button.textContent = "查看完整画面";
        button.addEventListener("click", () => openFullArt(series.title, cards[0].fullImageUrl));
        section.append(button);
      }
      return section;
    });
    collectionRoot.replaceChildren(...groups);
    document.querySelector("[data-collection-count]").textContent = String(new Set(savedFive.map((card) => card.slug)).size);
    document.querySelector("[data-complete-count]").textContent = String(completed);
  };

  const setSelectedPool = (poolKey) => {
    if (!admin || todaySavedCard || !currentDraws.has(poolKey)) return;
    selectedPool = poolKey;
    document.querySelectorAll("[data-drawn-choice]").forEach((choice) => {
      const selected = choice.dataset.drawnChoice === selectedPool;
      choice.classList.toggle("is-selected", selected);
      choice.setAttribute("aria-pressed", String(selected));
    });
    syncSaveButton();
  };

  const setDrawControls = (poolKey, state) => {
    document.querySelectorAll(`[data-draw-button="${poolKey}"]`).forEach((button) => {
      button.disabled = state === "drawing" || state === "done";
      const label = button.querySelector("[data-draw-action-label]");
      if (!label) return;
      if (state === "drawing") label.textContent = "抽取中";
      else if (state === "done") label.textContent = "今日已抽";
      else if (state === "repeat") label.textContent = button.classList.contains("draw-start") ? "再抽一次" : "再抽";
      else label.textContent = button.classList.contains("draw-start") ? "开始抽取" : "抽取";
    });
  };

  const openDrawResult = (card) => {
    if (!drawResultDialog || !drawResultImage) return;
    const normalized = normalizeCard(card);
    document.querySelector("[data-draw-result-name]").textContent = normalized.name;
    document.querySelector("[data-draw-result-meta]").textContent = normalized.category === "five-piece"
      ? `${normalized.seriesTitle} · 第 ${normalized.pieceIndex} 张`
      : (normalized.school ? `${normalized.school} · ${normalized.title}` : normalized.title);
    drawResultMedia.classList.remove("is-loaded", "is-error");
    drawResultLoading.textContent = "卡片正在出现";
    drawResultImage.alt = `${normalized.seriesTitle || normalized.title}，${normalized.name}`;
    drawResultImage.onload = () => drawResultMedia.classList.add("is-loaded");
    drawResultImage.onerror = () => {
      drawResultMedia.classList.add("is-error");
      drawResultLoading.textContent = "卡片暂时没有加载出来";
    };
    drawResultImage.src = assetUrl(normalized.imageUrl);
    if (!drawResultDialog.open) drawResultDialog.showModal();
  };

  const createDrawnCard = (card, poolKey) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `drawn-card is-${card.category}`;
    button.dataset.drawnChoice = poolKey;
    button.setAttribute("aria-label", `查看今天抽到的${card.name}卡片`);
    const img = document.createElement("img");
    img.src = assetUrl(card.imageUrl);
    img.alt = `${card.seriesTitle || card.title}，${card.name}`;
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = card.name;
    const detail = document.createElement("small");
    detail.textContent = card.category === "five-piece"
      ? `${card.seriesTitle} · 第 ${card.pieceIndex} 张`
      : (card.school ? `${card.school} · ${card.title}` : card.title);
    copy.append(title, detail);
    button.append(img, copy);
    button.addEventListener("click", () => openDrawResult(card));
    return button;
  };

  const syncSaveButton = () => {
    if (!admin || !saveDrawnButton) return;
    const selected = currentDraws.get(selectedPool);
    const hasReward = rewardStatus.some((status) => status.color === selectedRewardColor && Number(status.available_count) > 0);
    saveDrawnButton.disabled = Boolean(todaySavedCard) || !selected?.id || !hasReward;
    if (todaySavedCard) {
      saveDrawnButton.textContent = "今天已经保存过一张";
    } else if (selected && !selected.id) {
      saveDrawnButton.textContent = "请先在后台同步卡池";
    } else {
      saveDrawnButton.textContent = "保存所选卡片";
    }
  };

  const showDrawnCard = (poolKey, card, animate = true, revealResult = false) => {
    const normalized = normalizeCard(card);
    currentDraws.set(poolKey, normalized);
    const machine = document.querySelector(`[data-draw-machine="${poolKey}"]`);
    const slot = document.querySelector(`[data-draw-card="${poolKey}"]`);
    if (animate) slot.classList.add("is-revealing");
    slot.replaceChildren(createDrawnCard(normalized, poolKey));
    window.setTimeout(() => slot.classList.remove("is-revealing"), 620);
    machine?.classList.remove("is-drawing");
    machine?.classList.add("has-result");
    setDrawControls(poolKey, "repeat");
    document.querySelector(`[data-draw-status="${poolKey}"]`).textContent = normalized.name;
    if (revealResult) openDrawResult(normalized);
  };

  const runDrawAnimation = (poolKey, card) => {
    if (drawingPools.has(poolKey)) return;
    drawingPools.add(poolKey);
    const machine = document.querySelector(`[data-draw-machine="${poolKey}"]`);
    const slot = document.querySelector(`[data-draw-card="${poolKey}"]`);
    machine?.classList.add("is-drawing");
    machine?.classList.remove("has-result");
    setDrawControls(poolKey, "drawing");
    document.querySelector(`[data-draw-status="${poolKey}"]`).textContent = "抽取中";
    drawMessage.textContent = "";

    const pending = document.createElement("div");
    pending.className = "draw-placeholder is-drawing";
    const stack = document.createElement("div");
    stack.className = "draw-card-stack";
    stack.setAttribute("aria-hidden", "true");
    stack.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
    const pendingLabel = document.createElement("span");
    pendingLabel.textContent = "DRAWING";
    const pendingTitle = document.createElement("strong");
    pendingTitle.textContent = "抽取中";
    pending.append(stack, pendingLabel, pendingTitle);
    slot.replaceChildren(pending);

    const duration = prefersReducedMotion.matches ? 160 : 1080;
    window.setTimeout(() => {
      drawingPools.delete(poolKey);
      showDrawnCard(poolKey, card, true, true);
      drawMessage.textContent = "今日抽取完成。";
    }, duration);
  };

  const drawCard = (poolKey) => {
    const cardPool = pools.get(poolKey) || [];
    if (!cardPool.length) {
      drawMessage.textContent = poolKey === "robomaster" ? "RoboMaster 卡片素材还没有加入。" : "卡池正在准备中，请稍后再来。";
      return;
    }
    const date = today();
    const dailyKey = `robosheep-draw:${poolKey}:${date}`;
    const savedSlug = readValue(dailyKey);
    if (savedSlug) {
      const existing = cardPool.find((card) => card.slug === savedSlug);
      if (existing) runDrawAnimation(poolKey, existing);
      return;
    }
    const collectedSlugs = new Set(savedCards.map((card) => card.slug));
    const candidates = cardPool.filter((card) => !collectedSlugs.has(card.slug));
    if (!candidates.length) {
      drawMessage.textContent = poolKey === "five-piece" ? "五联卡已经全部集齐。" : "这个卡池已经全部收藏完成。";
      return;
    }
    const picked = candidates[randomIndex(candidates.length)];
    writeValue(dailyKey, picked.slug);
    runDrawAnimation(poolKey, picked);
  };

  const renderRewardStatus = () => {
    if (!rewardColors) return;
    rewardColors.replaceChildren(...rewardStatus.map((status) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `reward-color is-${status.color}`;
      button.disabled = Number(status.available_count) <= 0 || Boolean(todaySavedCard);
      button.setAttribute("aria-pressed", String(selectedRewardColor === status.color));
      const label = colors.find((color) => color.key === status.color)?.label || status.color;
      const dot = document.createElement("i");
      dot.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.textContent = label;
      const count = document.createElement("strong");
      count.textContent = `${status.available_count} 份`;
      button.append(dot, text, count);
      button.addEventListener("click", () => {
        selectedRewardColor = status.color;
        renderRewardStatus();
      });
      return button;
    }));
    if (!selectedRewardColor || !rewardStatus.some((status) => status.color === selectedRewardColor && Number(status.available_count) > 0)) {
      selectedRewardColor = rewardStatus.find((status) => Number(status.available_count) > 0)?.color || "";
      rewardColors.querySelectorAll("button").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.classList.contains(`is-${selectedRewardColor}`)));
      });
    }
    syncSaveButton();
  };

  const loadRewardStatus = async () => {
    if (!admin) return;
    const { data, error } = await client.rpc("growth_reward_status");
    rewardStatus = error ? [] : (data || []);
    renderRewardStatus();
  };

  const saveDrawnCard = async () => {
    if (!saveDrawnButton) return;
    const card = currentDraws.get(selectedPool);
    if (!card || todaySavedCard) return;
    if (!card.id) {
      drawMessage.textContent = "这张卡尚未同步到数据库，请先在后台同步五联卡池。";
      return;
    }
    if (!selectedRewardColor) {
      drawMessage.textContent = "目前还没有可用的同色保存资格。";
      return;
    }
    saveDrawnButton.disabled = true;
    drawMessage.textContent = "正在把所选卡片留在墙上...";
    const { data, error } = await client.rpc("save_growth_card", {
      p_card_id: card.id,
      p_color: selectedRewardColor,
      p_draw_date: today(),
    });
    if (error) {
      drawMessage.textContent = error.message;
      syncSaveButton();
      return;
    }
    if (data?.status === "duplicate") drawMessage.textContent = "这张卡已经收藏过，保存资格没有被消耗。";
    else if (data?.status === "day-used") drawMessage.textContent = "今天已经选择过一张卡。";
    else drawMessage.textContent = "卡片已经留在墙上，另一张结果不会被收藏。";
    await loadAll();
  };

  const mergeBuiltInCards = (builtIn, databaseRows) => {
    const databaseBySlug = new Map(databaseRows.map((card) => [card.slug, card]));
    const merged = builtIn.map((card) => {
      const databaseCard = databaseBySlug.get(card.slug) || {};
      databaseBySlug.delete(card.slug);
      return normalizeCard({ ...card, ...databaseCard });
    });
    return [...merged, ...databaseBySlug.values()].map(normalizeCard);
  };

  const loadAll = async () => {
    const currentYear = Number(beijingParts().year);
    let dayRows = [];
    let databaseCards = [];
    let savedRows = [];
    if (client) {
      const [daysResult, cardsResult, savedResult, sessionResult] = await Promise.all([
        client.from("public_growth_days").select("record_date,color").order("record_date", { ascending: true }),
        client.from("reward_cards").select("*").eq("is_visible", true).order("sort_order", { ascending: true }),
        client.from("public_saved_growth_cards").select("*").order("saved_at", { ascending: false }),
        client.auth.getSession(),
      ]);
      if (!daysResult.error) dayRows = daysResult.data || [];
      if (!cardsResult.error) databaseCards = cardsResult.data || [];
      if (!savedResult.error) savedRows = savedResult.data || [];
      if (sessionResult.data.session) {
        const { data: isAdmin } = await client.rpc("is_site_admin");
        admin = Boolean(isAdmin);
      }
    }

    const databaseFive = databaseCards.filter((card) => card.category === "five-piece");
    const databaseTeams = databaseCards.filter((card) => card.category === "robomaster");
    pools.set("five-piece", mergeBuiltInCards(builtInFiveCards, databaseFive));
    pools.set("robomaster", mergeBuiltInCards(builtInTeamCards, databaseTeams));
    document.querySelector(".draw-pools")?.classList.add("is-single");
    const allPoolCards = new Map([...pools.values()].flat().map((card) => [card.slug, card]));
    savedCards = savedRows.map((row) => normalizeCard({ ...(allPoolCards.get(row.slug) || {}), ...row }));
    growthDays = dayRows;
    todaySavedCard = savedCards.find((card) => card.drawDate === today()) || null;

    const years = new Set([currentYear, ...growthDays.map((day) => Number(day.record_date.slice(0, 4)))]);
    fillYearOptions(yearSelect, [...years].sort((a, b) => b - a));
    const savedYears = new Set([currentYear, ...savedCards.map((card) => card.savedYear).filter(Boolean)]);
    fillYearOptions(savedYearSelect, [...savedYears].sort((a, b) => b - a));
    renderCalendar();
    renderBadges();
    renderSavedCards();
    renderCollections();
    if (adminSave) adminSave.hidden = true;

    for (const poolKey of ["five-piece"]) {
      const cardPool = pools.get(poolKey) || [];
      const dailySlug = readValue(`robosheep-draw:${poolKey}:${today()}`);
      const dailyCard = cardPool.find((card) => card.slug === dailySlug);
      if (dailyCard) showDrawnCard(poolKey, dailyCard, false);
      else if (cardPool.length) {
        setDrawControls(poolKey, "ready");
        document.querySelector(`[data-draw-status="${poolKey}"]`).textContent = "尚未抽取";
      }
    }
    if (todaySavedCard) {
      selectedPool = todaySavedCard.category;
      drawMessage.textContent = `今天已经选择“${todaySavedCard.name}”挂墙。`;
    }
    syncSaveButton();
  };

  yearSelect.addEventListener("change", renderCalendar);
  savedYearSelect.addEventListener("change", renderSavedCards);
  document.querySelectorAll("[data-draw-button]").forEach((button) => {
    button.addEventListener("click", () => drawCard(button.dataset.drawButton));
  });
  saveDrawnButton?.addEventListener("click", saveDrawnCard);
  document.querySelector("[data-close-draw-result]").addEventListener("click", () => drawResultDialog.close());
  drawResultDialog.addEventListener("click", (event) => {
    if (event.target === drawResultDialog) drawResultDialog.close();
  });
  document.querySelector("[data-close-full-art]").addEventListener("click", () => fullArtDialog.close());
  fullArtDialog.addEventListener("click", (event) => {
    if (event.target === fullArtDialog) fullArtDialog.close();
  });
  loadAll();
})();
