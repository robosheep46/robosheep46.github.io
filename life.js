(() => {
  const store = window.contentStore;
  const root = document.querySelector("[data-life-album]");
  if (!store || !root) return;

  const imageUrl = (image) => typeof image === "string" ? image : image?.url;

  const render = async () => {
    const photos = await store.listPublished("photo");
    if (!photos.length) {
      root.innerHTML = '<p class="content-empty">还没有公开照片。</p>';
      return;
    }

    const album = document.createElement("div");
    album.className = "album";
    const stage = document.createElement("div");
    stage.className = "album-stage";
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "album-nav album-prev";
    prev.setAttribute("aria-label", "上一张");
    const frame = document.createElement("div");
    frame.className = "album-frame";
    const next = document.createElement("button");
    next.type = "button";
    next.className = "album-nav album-next";
    next.setAttribute("aria-label", "下一张");
    const commentPanels = document.createElement("div");
    commentPanels.className = "album-comment-panels";

    const cards = photos.map((photo, index) => {
      const figure = document.createElement("figure");
      figure.className = `life-card${index === 0 ? " is-on" : ""}`;
      const image = document.createElement("img");
      image.src = imageUrl(photo.images?.[0]);
      image.alt = photo.title || "生活照片";
      image.loading = index === 0 ? "eager" : "lazy";
      image.tabIndex = 0;
      image.title = "查看大图";
      const caption = document.createElement("figcaption");
      const time = document.createElement("time");
      time.dateTime = photo.happened_at;
      time.textContent = store.dateLabel(photo.happened_at);
      const title = document.createElement("h2");
      title.textContent = photo.title;
      caption.append(time, title);
      if (photo.body && photo.body !== photo.title) {
        const description = document.createElement("p");
        description.textContent = photo.body;
        caption.append(description);
      }
      figure.append(image, caption);

      const comments = document.createElement("section");
      comments.className = "comments-section";
      comments.dataset.comments = "";
      comments.dataset.albumComment = "";
      comments.dataset.commentKind = "life_image";
      comments.dataset.commentKey = photo.slug;
      comments.hidden = index !== 0;
      commentPanels.append(comments);
      return figure;
    });
    frame.append(...cards);
    stage.append(prev, frame, next);
    album.append(stage, commentPanels);
    root.replaceChildren(album);

    let index = 0;
    const panels = [...commentPanels.children];
    const show = (nextIndex) => {
      index = Math.max(0, Math.min(cards.length - 1, nextIndex));
      cards.forEach((card, cardIndex) => card.classList.toggle("is-on", cardIndex === index));
      panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== index; });
      prev.disabled = index === 0;
      next.disabled = index === cards.length - 1;
    };
    prev.addEventListener("click", () => show(index - 1));
    next.addEventListener("click", () => show(index + 1));
    let startX = 0;
    frame.addEventListener("touchstart", (event) => { startX = event.changedTouches[0].clientX; }, { passive: true });
    frame.addEventListener("touchend", (event) => {
      const distance = event.changedTouches[0].clientX - startX;
      if (distance > 40) show(index - 1);
      if (distance < -40) show(index + 1);
    }, { passive: true });

    const viewer = document.querySelector("[data-image-viewer]");
    const viewerImage = viewer?.querySelector("[data-image-viewer-image]");
    const openViewer = (image) => {
      if (!viewer || !viewerImage) return;
      viewerImage.src = image.src;
      viewerImage.alt = image.alt;
      viewer.showModal();
    };
    cards.forEach((card) => {
      const image = card.querySelector("img");
      image.addEventListener("click", () => openViewer(image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") openViewer(image);
      });
    });
    viewer?.querySelector("[data-image-viewer-close]")?.addEventListener("click", () => viewer.close());
    viewer?.addEventListener("click", (event) => {
      if (event.target === viewer) viewer.close();
    });
    show(0);
    window.robosheepComments?.mountAll(commentPanels);
  };

  render();
})();
