(() => {
  const store = window.contentStore;
  const client = store?.client;
  const panel = document.querySelector("[data-growth-manager]");
  if (!client || !panel) return;

  const form = document.querySelector("[data-growth-day-form]");
  const dateLabel = document.querySelector("[data-growth-date-label]");
  const colorPreview = document.querySelector("[data-growth-color-preview]");
  const dayMessage = document.querySelector("[data-growth-day-message]");
  const rewardRoot = document.querySelector("[data-admin-reward-status]");
  const cardList = document.querySelector("[data-admin-card-list]");
  const cardCount = document.querySelector("[data-admin-card-count]");
  const cardMessage = document.querySelector("[data-admin-card-message]");
  const cardSearch = document.querySelector("[data-admin-card-search]");
  const builtInCards = [...(window.ROBOSHEEP_GROWTH_CARDS || [])];
  const colorLabels = new Map([
    ["moon", "月光金"],
    ["mist", "雾霭蓝"],
    ["pine", "松针绿"],
    ["dusk", "暮色粉"],
    ["lilac", "淡紫灰"],
  ]);
  let selectedDate = "";
  let databaseCards = [];
  let hasOpened = false;

  const beijingDate = (offset = 0) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    const date = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  };

  const formatDate = (value) => new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

  const refreshIcons = () => window.lucide?.createIcons?.({ attrs: { "aria-hidden": "true" } });

  const setDateMode = async (mode) => {
    selectedDate = mode === "yesterday" ? beijingDate(-1) : beijingDate();
    document.querySelectorAll("[data-growth-date]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.growthDate === mode));
    });
    dateLabel.textContent = formatDate(selectedDate);
    dayMessage.textContent = "";
    colorPreview.className = "";
    colorPreview.textContent = "尚未点亮";
    form.elements.did_meaningful.checked = false;
    form.elements.made_breakthrough.checked = false;
    form.elements.private_note.value = "";
    const { data, error } = await client
      .from("growth_days")
      .select("record_date,did_meaningful,made_breakthrough,private_note,color")
      .eq("record_date", selectedDate)
      .maybeSingle();
    if (error) {
      dayMessage.textContent = error.message;
      return;
    }
    if (!data) return;
    form.elements.did_meaningful.checked = Boolean(data.did_meaningful);
    form.elements.made_breakthrough.checked = Boolean(data.made_breakthrough);
    form.elements.private_note.value = data.private_note || "";
    if (data.color) {
      colorPreview.className = `is-${data.color}`;
      colorPreview.textContent = `已点亮 · ${colorLabels.get(data.color) || data.color}`;
    }
  };

  const loadRewards = async () => {
    const { data, error } = await client.rpc("growth_reward_status");
    if (error) {
      rewardRoot.innerHTML = `<p class="admin-empty">${error.message}</p>`;
      return;
    }
    rewardRoot.replaceChildren(...(data || []).map((status) => {
      const row = document.createElement("div");
      row.className = `admin-reward-row is-${status.color}`;
      const label = document.createElement("span");
      const dot = document.createElement("i");
      dot.setAttribute("aria-hidden", "true");
      const name = document.createElement("strong");
      name.textContent = colorLabels.get(status.color) || status.color;
      label.append(dot, name);
      const counts = document.createElement("p");
      counts.textContent = `${status.lit_count} 格 · 已使用 ${status.redeemed_count} · 可保存 ${status.available_count}`;
      row.append(label, counts);
      return row;
    }));
  };

  const renderCards = () => {
    const synced = new Map(databaseCards.map((card) => [card.slug, card]));
    const query = cardSearch.value.trim().toLocaleLowerCase("zh-CN");
    const filtered = builtInCards.filter((card) => `${card.seriesTitle} ${card.name}`.toLocaleLowerCase("zh-CN").includes(query));
    const syncedCount = builtInCards.filter((card) => synced.has(card.slug)).length;
    cardCount.textContent = `${syncedCount} / ${builtInCards.length} 已同步`;
    cardList.replaceChildren(...filtered.map((card) => {
      const article = document.createElement("article");
      article.className = synced.has(card.slug) ? "is-synced" : "";
      const img = document.createElement("img");
      img.src = card.imageUrl;
      img.alt = "";
      img.loading = "lazy";
      const copy = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = card.name;
      const detail = document.createElement("span");
      detail.textContent = `${card.seriesTitle} · ${card.pieceIndex} / ${card.pieceCount}`;
      copy.append(title, detail);
      const state = document.createElement("small");
      state.textContent = synced.has(card.slug) ? "已同步" : "待同步";
      article.append(img, copy, state);
      return article;
    }));
  };

  const loadCards = async () => {
    const { data, error } = await client
      .from("reward_cards")
      .select("id,slug,category")
      .eq("category", "five-piece");
    if (error) {
      cardMessage.textContent = error.message;
      databaseCards = [];
    } else {
      cardMessage.textContent = "";
      databaseCards = data || [];
    }
    renderCards();
  };

  const syncCards = async () => {
    const button = document.querySelector("[data-sync-card-pool]");
    button.disabled = true;
    cardMessage.textContent = "正在同步五联卡数据...";
    const payload = builtInCards.map((card) => ({
      slug: card.slug,
      category: "five-piece",
      person_name: card.name,
      school_name: "",
      title: card.seriesTitle,
      quote: "",
      source_label: "五联卡合集",
      source_url: "",
      image_query: "",
      image_url: card.imageUrl,
      collection_key: card.seriesKey,
      collection_title: card.seriesTitle,
      piece_index: card.pieceIndex,
      piece_count: card.pieceCount,
      full_image_url: card.fullImageUrl,
      sort_order: card.sortOrder,
      is_visible: true,
    }));
    const { error } = await client.from("reward_cards").upsert(payload, { onConflict: "slug" });
    if (error) {
      cardMessage.textContent = `${error.message}。如提示缺少字段，请先在 Supabase SQL Editor 重新运行 setup.sql。`;
    } else {
      cardMessage.textContent = "40 张五联卡已经同步完成。";
      await loadCards();
    }
    button.disabled = false;
  };

  const saveDay = async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    dayMessage.textContent = "正在保存...";
    const payload = {
      record_date: selectedDate,
      did_meaningful: form.elements.did_meaningful.checked,
      made_breakthrough: form.elements.made_breakthrough.checked,
      private_note: form.elements.private_note.value.trim(),
    };
    const { error } = await client.from("growth_days").upsert(payload, { onConflict: "record_date" });
    if (error) {
      dayMessage.textContent = error.message;
    } else {
      dayMessage.textContent = payload.did_meaningful || payload.made_breakthrough
        ? "记录已保存，今天的格子已经点亮。"
        : "记录已保存；因为两项都未选择，这一天不会公开点亮。";
      await Promise.all([setDateMode(selectedDate === beijingDate(-1) ? "yesterday" : "today"), loadRewards()]);
    }
    submit.disabled = false;
  };

  const openManager = async () => {
    if (hasOpened) {
      await Promise.all([setDateMode(selectedDate === beijingDate(-1) ? "yesterday" : "today"), loadRewards(), loadCards()]);
      return;
    }
    hasOpened = true;
    selectedDate = beijingDate();
    await Promise.all([setDateMode("today"), loadRewards(), loadCards()]);
    refreshIcons();
  };

  document.querySelectorAll("[data-growth-date]").forEach((button) => {
    button.addEventListener("click", () => setDateMode(button.dataset.growthDate));
  });
  form.addEventListener("submit", saveDay);
  cardSearch.addEventListener("input", renderCards);
  document.querySelector("[data-sync-card-pool]").addEventListener("click", syncCards);
  document.addEventListener("admin:growth-open", openManager);
})();
