(() => {
  const store = window.contentStore;
  if (!store) return;

  const imageUrl = (image) => typeof image === "string" ? image : image?.url;
  const paragraphsOf = (section) => Array.isArray(section.paragraphs)
    ? section.paragraphs
    : String(section.body || "").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const monthLabel = (value = "") => value.replace("-", ".");
  const storyHref = (post) => post.slug === "2023-robomaster"
    ? "./2023-robomaster.html"
    : `./story.html#id=${encodeURIComponent(post.slug || post.id)}`;

  const renderList = async (root) => {
    const posts = await store.listPublished("story");
    if (!posts.length) {
      root.innerHTML = '<p class="content-empty">还没有公开故事。</p>';
      return;
    }
    root.replaceChildren(...posts.map((post) => {
      const link = document.createElement("a");
      link.className = "story-list-item";
      link.href = storyHref(post);
      const cover = document.createElement("img");
      cover.src = imageUrl(post.images?.[0]) || "../media/story-ferris-3x2.png";
      cover.alt = "";
      cover.loading = "lazy";
      const shade = document.createElement("span");
      shade.className = "story-list-shade";
      const copy = document.createElement("span");
      copy.className = "story-list-copy";
      const months = (post.sections || []).map((section) => section.month).filter(Boolean).sort();
      const time = document.createElement("time");
      time.textContent = months.length > 1
        ? `${monthLabel(months[0])} - ${monthLabel(months.at(-1))}`
        : monthLabel(months[0]) || store.dateLabel(post.happened_at);
      const title = document.createElement("strong");
      title.textContent = post.title;
      const summary = document.createElement("span");
      summary.textContent = post.body || (post.sections || []).map((section) => section.heading).slice(0, 2).join("，");
      const arrow = document.createElement("i");
      arrow.textContent = "↗";
      arrow.setAttribute("aria-hidden", "true");
      copy.append(time, title, summary);
      link.append(cover, shade, copy, arrow);
      return link;
    }));
  };

  const bindAxis = (root) => {
    const axis = root.querySelector(".axis");
    const tabs = [...axis.querySelectorAll("[role='tab']")];
    const panels = [...root.querySelectorAll(":scope > .passage")];
    const show = (id, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.getAttribute("aria-controls") === id;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => { panel.hidden = panel.id !== id; });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => show(tab.getAttribute("aria-controls")));
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const offset = event.key === "ArrowRight" ? 1 : -1;
        const next = tabs[(index + offset + tabs.length) % tabs.length];
        show(next.getAttribute("aria-controls"), true);
      });
    });
  };

  const renderReader = async (root) => {
    const identity = root.dataset.storyId
      || new URLSearchParams(location.search).get("id")
      || new URLSearchParams(location.hash.slice(1)).get("id");
    if (!identity) {
      root.innerHTML = '<p class="content-empty">没有找到这篇故事。</p>';
      return;
    }
    const post = await store.getPublished("story", identity);
    if (!post) {
      root.innerHTML = '<p class="content-empty">这篇故事不存在或尚未公开。</p>';
      return;
    }

    document.title = `${post.title}｜robosheep 的小站`;
    const cover = imageUrl(post.images?.[0]);
    if (cover) document.body.style.setProperty("--inner-banner", `url("${cover.replaceAll('"', '%22')}")`);
    const topLink = document.querySelector("[data-story-back]");
    if (topLink) topLink.href = "./stories.html";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = post.title;
    const axis = document.createElement("div");
    axis.className = "axis";
    axis.setAttribute("role", "tablist");
    axis.setAttribute("aria-label", `${post.title}的时间线`);
    const sections = [...(post.sections || [])].sort((a, b) => String(a.month || "").localeCompare(String(b.month || "")));

    const panels = sections.map((section, index) => {
      const panelId = `story-node-${index + 1}`;
      const tabId = `story-tab-${index + 1}`;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = tabId;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(index === 0));
      tab.setAttribute("aria-controls", panelId);
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.textContent = monthLabel(section.month);
      axis.append(tab);

      const article = document.createElement("article");
      article.className = "passage";
      article.id = panelId;
      article.setAttribute("role", "tabpanel");
      article.setAttribute("aria-labelledby", tabId);
      article.hidden = index !== 0;
      const when = document.createElement("p");
      when.className = "passage-when";
      when.textContent = monthLabel(section.month);
      const heading = document.createElement("h2");
      heading.textContent = section.heading;
      article.append(when, heading);
      paragraphsOf(section).forEach((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        article.append(paragraph);
      });
      const comments = document.createElement("section");
      comments.className = "comments-section";
      comments.dataset.comments = "";
      comments.dataset.commentKind = "story_node";
      comments.dataset.commentKey = section.key;
      article.append(comments);
      return article;
    });

    const back = document.createElement("a");
    back.className = "pill story-back";
    back.href = "./stories.html";
    back.textContent = "返回故事";
    root.replaceChildren(eyebrow, axis, ...panels, back);
    if (sections.length) bindAxis(root);
    window.robosheepComments?.mountAll(root);
  };

  document.querySelectorAll("[data-story-list]").forEach(renderList);
  document.querySelectorAll("[data-story-reader]").forEach(renderReader);
})();
