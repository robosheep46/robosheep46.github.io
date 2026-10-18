(() => {
  const store = window.contentStore;
  if (!store) return;

  const imageUrl = (image) => typeof image === "string" ? image : image?.url;
  const splitParagraphs = (section) => {
    if (Array.isArray(section.paragraphs)) return section.paragraphs;
    return String(section.body || "").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  };

  const renderList = async (root) => {
    const list = root.querySelector("[data-weekly-list-items]");
    const posts = await store.listPublished("weekly");
    if (!posts.length) {
      list.innerHTML = '<p class="content-empty">还没有公开周报。</p>';
      return;
    }

    list.replaceChildren(...posts.map((post) => {
      const link = document.createElement("a");
      link.className = "weekly-list-item";
      link.href = `./weekly-post.html#id=${encodeURIComponent(post.slug || post.id)}`;

      const date = document.createElement("time");
      date.dateTime = post.happened_at;
      date.textContent = store.dateLabel(post.happened_at);

      const title = document.createElement("h2");
      title.textContent = post.title;

      const summary = document.createElement("p");
      summary.textContent = store.summaryFromSections(post.sections);

      link.append(date, title, summary);
      return link;
    }));
  };

  const renderReader = async (root) => {
    const identity =
      new URLSearchParams(location.search).get("id") ||
      new URLSearchParams(location.hash.slice(1)).get("id");
    if (!identity) {
      root.innerHTML = '<p class="content-empty">没有找到这篇周报。</p>';
      return;
    }
    const post = await store.getPublished("weekly", identity);
    if (!post) {
      root.innerHTML = '<p class="content-empty">这篇周报不存在或尚未公开。</p>';
      return;
    }

    document.title = `${post.title}｜robosheep 的小站`;
    const header = document.createElement("header");
    header.className = "weekly-reader-head entry-band";
    const date = document.createElement("time");
    date.dateTime = post.happened_at;
    date.textContent = store.dateLabel(post.happened_at);
    const title = document.createElement("h1");
    title.textContent = post.title;
    const summary = document.createElement("p");
    summary.textContent = store.summaryFromSections(post.sections);
    header.append(date, title, summary);

    const sections = post.sections.map((section) => {
      const article = document.createElement("article");
      article.className = "weekly-section";
      const heading = document.createElement("h2");
      heading.textContent = section.heading;
      article.append(heading);

      splitParagraphs(section).forEach((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        article.append(paragraph);
      });

      if (Array.isArray(section.images) && section.images.length) {
        const gallery = document.createElement("div");
        gallery.className = "weekly-section-images";
        section.images.forEach((image) => {
          const img = document.createElement("img");
          img.src = imageUrl(image);
          img.alt = "";
          img.loading = "lazy";
          gallery.append(img);
        });
        article.append(gallery);
      }
      return article;
    });

    root.replaceChildren(header, ...sections);
  };

  document.querySelectorAll("[data-weekly-list]").forEach(renderList);
  document.querySelectorAll("[data-weekly-reader]").forEach(renderReader);
})();
