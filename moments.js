(() => {
  const store = window.contentStore;
  const list = document.querySelector("[data-moments-list]");
  if (!store || !list) return;

  const imageUrl = (image) => typeof image === "string" ? image : image?.url;
  const viewer = document.querySelector("[data-image-viewer]");
  const viewerImage = viewer?.querySelector("[data-image-viewer-image]");
  const viewerClose = viewer?.querySelector("[data-image-viewer-close]");

  const openImage = (src) => {
    if (!viewer || !viewerImage) return;
    viewerImage.src = src;
    viewer.showModal();
  };

  viewerClose?.addEventListener("click", () => viewer.close());
  viewer?.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });

  const render = async () => {
    const posts = await store.listPublished("moment");
    if (!posts.length) {
      list.innerHTML = '<div class="moments-empty"><p>这里还没有公开动态。</p></div>';
      return;
    }

    list.replaceChildren(...posts.map((post) => {
      const article = document.createElement("article");
      article.className = "moment-entry";

      const rail = document.createElement("div");
      rail.className = "moment-rail";
      const time = document.createElement("time");
      time.dateTime = post.happened_at;
      time.textContent = store.dateLabel(post.happened_at);
      rail.append(time);

      const content = document.createElement("div");
      content.className = "moment-content";
      const body = document.createElement("p");
      body.textContent = post.body;
      content.append(body);

      if (post.images.length) {
        const gallery = document.createElement("div");
        gallery.className = `moment-gallery moment-gallery-${Math.min(post.images.length, 4)}`;
        post.images.forEach((image) => {
          const src = imageUrl(image);
          const button = document.createElement("button");
          button.type = "button";
          button.setAttribute("aria-label", "查看大图");
          const img = document.createElement("img");
          img.src = src;
          img.alt = "";
          img.loading = "lazy";
          button.append(img);
          button.addEventListener("click", () => openImage(src));
          gallery.append(button);
        });
        content.append(gallery);
      }

      article.append(rail, content);
      return article;
    }));
  };

  render();
})();
