(() => {
  const store = window.contentStore;
  const client = store?.client;
  const loginPanel = document.querySelector("[data-admin-login]");
  const studio = document.querySelector("[data-admin-studio]");
  const loginForm = document.querySelector("[data-login-form]");
  const loginMessage = document.querySelector("[data-login-message]");
  const configWarning = document.querySelector("[data-config-warning]");
  const postForm = document.querySelector("[data-post-form]");
  const postList = document.querySelector("[data-post-list]");
  const sectionsRoot = document.querySelector("[data-sections]");
  const sectionTemplate = document.querySelector("#section-editor-template");
  const momentFields = document.querySelector("[data-moment-fields]");
  const weeklyFields = document.querySelector("[data-weekly-fields]");
  const saveMessage = document.querySelector("[data-save-message]");
  const importButton = document.querySelector("[data-import-weeklies]");
  const commentsTab = document.querySelector("[data-comments-tab]");
  const postControls = document.querySelector("[data-post-controls]");
  const postEditor = document.querySelector("[data-post-editor]");
  const commentsManager = document.querySelector("[data-comments-manager]");
  const commentsList = document.querySelector("[data-admin-comments-list]");
  const commentsMessage = document.querySelector("[data-comments-message]");

  let kind = "moment";
  let posts = [];
  let currentPost = null;
  let removedPaths = [];

  const setMessage = (node, message, tone = "") => {
    node.textContent = message;
    node.dataset.tone = tone;
  };

  const toLocalInput = (value = new Date()) => {
    const date = value instanceof Date ? value : new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const imageRecord = (image) => typeof image === "string" ? { url: image, path: "" } : image;
  const allPostImages = (post) => [
    ...(post.images || []),
    ...(post.sections || []).flatMap((section) => section.images || []),
  ].map(imageRecord);

  const makeImageChip = (image, onRemove) => {
    const record = imageRecord(image);
    const wrapper = document.createElement("figure");
    const img = document.createElement("img");
    img.src = record.url;
    img.alt = "";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "×";
    button.title = "移除图片";
    button.setAttribute("aria-label", "移除图片");
    button.addEventListener("click", () => {
      if (record.path) removedPaths.push(record.path);
      wrapper.remove();
      onRemove?.(record);
    });
    wrapper.dataset.url = record.url;
    wrapper.dataset.path = record.path || "";
    wrapper.append(img, button);
    return wrapper;
  };

  const readExistingImages = (root) => [...root.querySelectorAll("figure")].map((figure) => ({
    url: figure.dataset.url,
    path: figure.dataset.path,
  }));

  const updateSectionNumbers = () => {
    sectionsRoot.querySelectorAll("[data-section-editor]").forEach((section, index) => {
      section.querySelector("[data-section-number]").textContent = String(index + 1).padStart(2, "0");
    });
  };

  const addSection = (section = {}) => {
    const fragment = sectionTemplate.content.cloneNode(true);
    const editor = fragment.querySelector("[data-section-editor]");
    editor.querySelector("[data-section-heading]").value = section.heading || "";
    const paragraphs = Array.isArray(section.paragraphs)
      ? section.paragraphs
      : String(section.body || "").split(/\n\s*\n/).filter(Boolean);
    editor.querySelector("[data-section-body]").value = paragraphs.join("\n\n");
    const strip = editor.querySelector("[data-section-existing-images]");
    (section.images || []).forEach((image) => strip.append(makeImageChip(image)));
    editor.querySelector("[data-remove-section]").addEventListener("click", () => {
      readExistingImages(strip).forEach((image) => {
        if (image.path) removedPaths.push(image.path);
      });
      editor.remove();
      updateSectionNumbers();
    });
    sectionsRoot.append(fragment);
    updateSectionNumbers();
  };

  const setKind = (nextKind) => {
    kind = nextKind;
    commentsTab.setAttribute("aria-selected", "false");
    postControls.hidden = false;
    postEditor.hidden = false;
    commentsManager.hidden = true;
    document.querySelectorAll("[data-kind-tab]").forEach((tab) => {
      tab.setAttribute("aria-selected", tab.dataset.kindTab === kind ? "true" : "false");
    });
    document.querySelector("[data-new-post]").textContent = kind === "moment" ? "新建动态" : "新建周报";
    momentFields.hidden = kind !== "moment";
    weeklyFields.hidden = kind !== "weekly";
    renderPostList();
    resetEditor();
  };

  const commentTargetLabel = (comment) => {
    if (comment.target_kind === "life_image") {
      return {
        "2026-10-17-pork": "生活相册 · 锅包肉",
        "2026-10-17-stew": "生活相册 · 铁锅炖",
      }[comment.target_key] || `生活相册 · ${comment.target_key}`;
    }
    if (comment.target_kind === "robomaster_node") {
      return `RoboMaster · ${comment.target_key.replace("-", ".")}`;
    }
    return {
      about: "关于我",
      interests: "兴趣爱好",
    }[comment.target_key] || comment.target_key;
  };

  const renderComments = (comments) => {
    if (!comments.length) {
      commentsList.innerHTML = '<p class="admin-empty">还没有公开评论。</p>';
      return;
    }
    const byId = new Map(comments.map((comment) => [comment.id, comment]));
    commentsList.replaceChildren(...comments.map((comment) => {
      const article = document.createElement("article");
      article.className = "admin-comment-item";

      const meta = document.createElement("div");
      meta.className = "admin-comment-meta";
      const nickname = document.createElement("strong");
      nickname.textContent = comment.nickname;
      const target = document.createElement("span");
      target.textContent = commentTargetLabel(comment);
      const time = document.createElement("time");
      time.dateTime = comment.created_at;
      time.textContent = new Date(comment.created_at).toLocaleString("zh-CN", { hour12: false });
      meta.append(nickname, target, time);

      const body = document.createElement("p");
      const parent = comment.parent_id ? byId.get(comment.parent_id) : null;
      body.textContent = parent ? `回复 ${parent.nickname}：${comment.body}` : comment.body;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "admin-danger";
      remove.textContent = "删除";
      remove.addEventListener("click", async () => {
        const warning = comment.parent_id
          ? "确定删除这条回复吗？"
          : "确定删除这条评论吗？它下面的回复也会一起删除。";
        if (!confirm(warning)) return;
        remove.disabled = true;
        const { error } = await client.rpc("delete_comment", { comment_id: comment.id });
        if (error) {
          setMessage(commentsMessage, error.message, "error");
          remove.disabled = false;
          return;
        }
        setMessage(commentsMessage, "评论已删除", "success");
        await loadComments();
      });

      article.append(meta, body, remove);
      return article;
    }));
  };

  const loadComments = async () => {
    setMessage(commentsMessage, "正在读取评论...");
    const { data, error } = await client
      .from("public_comments")
      .select("id,target_kind,target_key,nickname,body,parent_id,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      setMessage(commentsMessage, error.message, "error");
      return;
    }
    setMessage(commentsMessage, data?.length ? `共 ${data.length} 条评论` : "");
    renderComments(data || []);
  };

  const showComments = async () => {
    document.querySelectorAll("[data-kind-tab]").forEach((tab) => {
      tab.setAttribute("aria-selected", "false");
    });
    commentsTab.setAttribute("aria-selected", "true");
    postControls.hidden = true;
    postEditor.hidden = true;
    commentsManager.hidden = false;
    await loadComments();
  };

  const resetEditor = () => {
    currentPost = null;
    removedPaths = [];
    postForm.reset();
    postForm.elements.id.value = "";
    postForm.elements.status.value = "draft";
    postForm.elements.happened_at.value = toLocalInput();
    document.querySelector("[data-editor-kicker]").textContent = kind === "moment" ? "新建动态" : "新建周报";
    document.querySelector("[data-editor-title]").textContent = "尚未保存";
    document.querySelector("[data-delete-post]").hidden = true;
    document.querySelector("[data-moment-existing-images]").replaceChildren();
    sectionsRoot.replaceChildren();
    if (kind === "weekly") addSection();
    setMessage(saveMessage, "");
  };

  const editPost = (post) => {
    if (post.kind !== kind) setKind(post.kind);
    currentPost = post;
    removedPaths = [];
    postForm.elements.id.value = post.id;
    postForm.elements.status.value = post.status;
    postForm.elements.happened_at.value = toLocalInput(post.happened_at);
    postForm.elements.body.value = post.body || "";
    postForm.elements.title.value = post.title || "";
    document.querySelector("[data-editor-kicker]").textContent = post.kind === "moment" ? "编辑动态" : "编辑周报";
    document.querySelector("[data-editor-title]").textContent = post.title || store.dateLabel(post.happened_at);
    document.querySelector("[data-delete-post]").hidden = false;

    const momentStrip = document.querySelector("[data-moment-existing-images]");
    momentStrip.replaceChildren(...(post.images || []).map((image) => makeImageChip(image)));
    sectionsRoot.replaceChildren();
    (post.sections || []).forEach(addSection);
    if (post.kind === "weekly" && !(post.sections || []).length) addSection();
    setMessage(saveMessage, "");
  };

  const renderPostList = () => {
    const visible = posts.filter((post) => post.kind === kind);
    importButton.hidden = kind !== "weekly" || visible.length > 0;
    if (!visible.length) {
      postList.innerHTML = '<p class="admin-empty">还没有内容。</p>';
      return;
    }
    postList.replaceChildren(...visible.map((post) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-post-item";
      if (currentPost?.id === post.id) button.classList.add("is-active");
      const status = document.createElement("span");
      status.textContent = { draft: "草稿", published: "公开", hidden: "隐藏" }[post.status] || post.status;
      const title = document.createElement("strong");
      title.textContent = post.title || post.body?.slice(0, 36) || "未命名";
      const date = document.createElement("time");
      date.textContent = store.dateLabel(post.happened_at);
      button.append(status, title, date);
      button.addEventListener("click", () => {
        editPost(post);
        renderPostList();
      });
      return button;
    }));
  };

  const loadPosts = async () => {
    const { data, error } = await client
      .from("posts")
      .select("*")
      .order("happened_at", { ascending: false });
    if (error) {
      setMessage(saveMessage, error.message, "error");
      return;
    }
    posts = data || [];
    renderPostList();
  };

  const optimizeImage = async (file) => {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return new Promise((resolve, reject) => canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("图片压缩失败")),
      "image/jpeg",
      0.84,
    ));
  };

  const uploadFiles = async (files, folder) => {
    const uploaded = [];
    for (const file of files) {
      const blob = await optimizeImage(file);
      const path = `${folder}/${crypto.randomUUID()}.jpg`;
      const { error } = await client.storage
        .from(store.config.storageBucket || "content-media")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      const { data } = client.storage.from(store.config.storageBucket || "content-media").getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, path });
    }
    return uploaded;
  };

  const collectSections = async (userId) => {
    const result = [];
    for (const [index, editor] of [...sectionsRoot.querySelectorAll("[data-section-editor]")].entries()) {
      const heading = editor.querySelector("[data-section-heading]").value.trim();
      const body = editor.querySelector("[data-section-body]").value.trim();
      const existing = readExistingImages(editor.querySelector("[data-section-existing-images]"));
      const files = [...editor.querySelector("[data-section-files]").files];
      const uploaded = await uploadFiles(files, `weekly/${userId}/${Date.now()}-${index}`);
      result.push({
        heading,
        paragraphs: body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean),
        images: [...existing, ...uploaded],
      });
    }
    return result;
  };

  const savePost = async (event) => {
    event.preventDefault();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const submit = postForm.querySelector('[type="submit"]');
    submit.disabled = true;
    setMessage(saveMessage, "正在保存...");
    try {
      const happenedAt = new Date(postForm.elements.happened_at.value).toISOString();
      const status = postForm.elements.status.value;
      let payload;
      if (kind === "moment") {
        const body = postForm.elements.body.value.trim();
        if (!body) throw new Error("请填写动态正文");
        const existing = readExistingImages(document.querySelector("[data-moment-existing-images]"));
        const files = [...postForm.elements.moment_images.files];
        const uploaded = await uploadFiles(files, `moment/${user.id}`);
        payload = {
          kind,
          slug: currentPost?.slug || `moment-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
          title: "",
          body,
          sections: [],
          images: [...existing, ...uploaded],
          status,
          happened_at: happenedAt,
          published_at: status === "published" ? (currentPost?.published_at || new Date().toISOString()) : currentPost?.published_at,
        };
      } else {
        const title = postForm.elements.title.value.trim();
        if (!title) throw new Error("请填写周报标题");
        const sections = await collectSections(user.id);
        if (!sections.length || sections.some((section) => !section.heading)) throw new Error("每个周报段落都需要小标题");
        payload = {
          kind,
          slug: currentPost?.slug || postForm.elements.happened_at.value.slice(0, 10),
          title,
          body: "",
          sections,
          images: [],
          status,
          happened_at: happenedAt,
          published_at: status === "published" ? (currentPost?.published_at || new Date().toISOString()) : currentPost?.published_at,
        };
      }

      const query = currentPost
        ? client.from("posts").update(payload).eq("id", currentPost.id).select().single()
        : client.from("posts").insert(payload).select().single();
      const { data, error } = await query;
      if (error) throw error;

      if (removedPaths.length) {
        await client.storage.from(store.config.storageBucket || "content-media").remove([...new Set(removedPaths)]);
      }
      setMessage(saveMessage, "已保存", "success");
      await loadPosts();
      editPost(data);
      renderPostList();
    } catch (error) {
      setMessage(saveMessage, error.message || "保存失败", "error");
    } finally {
      submit.disabled = false;
    }
  };

  const deletePost = async () => {
    if (!currentPost || !confirm("确定删除这条内容吗？删除后无法恢复。")) return;
    const paths = allPostImages(currentPost).map((image) => image.path).filter(Boolean);
    const { error } = await client.from("posts").delete().eq("id", currentPost.id);
    if (error) {
      setMessage(saveMessage, error.message, "error");
      return;
    }
    if (paths.length) await client.storage.from(store.config.storageBucket || "content-media").remove(paths);
    await loadPosts();
    resetEditor();
  };

  const importLegacyWeeklies = async () => {
    importButton.disabled = true;
    try {
      const rows = store.legacyWeeklies.map(({ id, ...post }) => ({ ...post }));
      const { error } = await client.from("posts").upsert(rows, { onConflict: "kind,slug" });
      if (error) throw error;
      await loadPosts();
      resetEditor();
    } catch (error) {
      setMessage(saveMessage, error.message || "导入失败", "error");
    } finally {
      importButton.disabled = false;
    }
  };

  const showStudio = async (session) => {
    const { data: isAdmin, error } = await client.rpc("is_site_admin");
    if (error || !isAdmin) {
      showLogin();
      setMessage(loginMessage, "这个账号没有内容后台权限", "error");
      return false;
    }
    loginPanel.hidden = true;
    studio.hidden = false;
    document.querySelector("[data-admin-email]").textContent = session.user.email;
    await loadPosts();
    resetEditor();
    return true;
  };

  const showLogin = () => {
    studio.hidden = true;
    loginPanel.hidden = false;
  };

  if (!client) {
    configWarning.hidden = false;
    loginForm.querySelector("button").disabled = true;
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(loginMessage, "正在登录...");
    const form = new FormData(loginForm);
    const { data, error } = await client.auth.signInWithPassword({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (error) {
      setMessage(loginMessage, "邮箱或密码不正确", "error");
      return;
    }
    setMessage(loginMessage, "");
    await showStudio(data.session);
  });

  document.querySelector("[data-sign-out]").addEventListener("click", async () => {
    await client.auth.signOut();
    showLogin();
  });
  document.querySelectorAll("[data-kind-tab]").forEach((tab) => {
    tab.addEventListener("click", () => setKind(tab.dataset.kindTab));
  });
  commentsTab.addEventListener("click", showComments);
  document.querySelector("[data-refresh-comments]").addEventListener("click", loadComments);
  document.querySelector("[data-new-post]").addEventListener("click", resetEditor);
  document.querySelector("[data-add-section]").addEventListener("click", () => addSection());
  document.querySelector("[data-delete-post]").addEventListener("click", deletePost);
  importButton.addEventListener("click", importLegacyWeeklies);
  postForm.addEventListener("submit", savePost);

  client.auth.getSession().then(({ data }) => {
    if (data.session) showStudio(data.session);
    else showLogin();
  });
})();
