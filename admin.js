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
  const weeklySectionsRoot = document.querySelector("[data-weekly-sections]");
  const storySectionsRoot = document.querySelector("[data-story-sections]");
  const weeklySectionTemplate = document.querySelector("#weekly-section-editor-template");
  const storySectionTemplate = document.querySelector("#story-section-editor-template");
  const happenedField = document.querySelector("[data-happened-field]");
  const saveMessage = document.querySelector("[data-save-message]");
  const commentsTab = document.querySelector("[data-comments-tab]");
  const growthTab = document.querySelector("[data-growth-tab]");
  const postControls = document.querySelector("[data-post-controls]");
  const postEditor = document.querySelector("[data-post-editor]");
  const commentsManager = document.querySelector("[data-comments-manager]");
  const growthManager = document.querySelector("[data-growth-manager]");
  const commentsList = document.querySelector("[data-admin-comments-list]");
  const commentsMessage = document.querySelector("[data-comments-message]");
  const contentTitle = document.querySelector("[data-content-title]");
  const contentDescription = document.querySelector("[data-content-description]");
  const contentCount = document.querySelector("[data-content-count]");
  const listMessage = document.querySelector("[data-list-message]");
  const sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  const sidebarOverlay = document.querySelector("[data-sidebar-overlay]");
  const fieldSections = {
    weekly: document.querySelector("[data-weekly-fields]"),
    story: document.querySelector("[data-story-fields]"),
    photo: document.querySelector("[data-photo-fields]"),
  };
  const kindLabels = { weekly: "周报", story: "故事", photo: "照片" };
  const kindDescriptions = {
    weekly: "整理每一周的学习、生活与思考。",
    story: "用时间节点讲述一段完整经历。",
    photo: "保存日常里值得被记住的画面。",
  };

  let kind = "weekly";
  let posts = [];
  let currentPost = null;
  let removedPaths = [];
  let pendingUploadPaths = [];
  let draggedStoryId = "";

  const refreshIcons = () => window.lucide?.createIcons({ attrs: { width: 16, height: 16 } });

  const closeSidebar = () => {
    studio.classList.remove("is-sidebar-open");
    sidebarToggle.setAttribute("aria-expanded", "false");
    sidebarOverlay.hidden = true;
  };

  const showView = (view) => {
    postControls.hidden = view !== "list";
    postEditor.hidden = view !== "editor";
    commentsManager.hidden = view !== "comments";
    growthManager.hidden = view !== "growth";
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const setMessage = (node, message, tone = "") => {
    node.textContent = message;
    node.dataset.tone = tone;
  };

  const toLocalInput = (value = new Date()) => {
    const date = value instanceof Date ? value : new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const toDateInput = (value = new Date()) => toLocalInput(value).slice(0, 10);
  const imageRecord = (image) => typeof image === "string" ? { url: image, path: "" } : image;
  const allPostImages = (post) => [
    ...(post.images || []),
    ...(post.sections || []).flatMap((section) => section.images || []),
  ].map(imageRecord);

  const makeImageChip = (image, onRemove) => {
    const record = imageRecord(image);
    const wrapper = document.createElement("figure");
    wrapper.dataset.url = record.url;
    wrapper.dataset.path = record.path || "";
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
    wrapper.append(img, button);
    return wrapper;
  };

  const readExistingImages = (root) => [...root.querySelectorAll("figure")].map((figure) => ({
    url: figure.dataset.url,
    path: figure.dataset.path,
  }));

  const updateWeeklyNumbers = () => {
    weeklySectionsRoot.querySelectorAll("[data-section-editor]").forEach((section, index) => {
      section.querySelector("[data-section-number]").textContent = String(index + 1).padStart(2, "0");
    });
  };

  const addWeeklySection = (section = {}) => {
    const fragment = weeklySectionTemplate.content.cloneNode(true);
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
      updateWeeklyNumbers();
    });
    weeklySectionsRoot.append(fragment);
    updateWeeklyNumbers();
    refreshIcons();
  };

  const updateStoryNumbers = () => {
    storySectionsRoot.querySelectorAll("[data-story-node]").forEach((node, index) => {
      const month = node.querySelector("[data-story-node-month]").value;
      node.querySelector("[data-story-node-number]").textContent = month || `节点 ${index + 1}`;
    });
  };

  const addStorySection = (section = {}) => {
    const fragment = storySectionTemplate.content.cloneNode(true);
    const editor = fragment.querySelector("[data-story-node]");
    editor.dataset.nodeKey = section.key || `node-${crypto.randomUUID()}`;
    editor.querySelector("[data-story-node-month]").value = section.month || "";
    editor.querySelector("[data-story-node-heading]").value = section.heading || "";
    const paragraphs = Array.isArray(section.paragraphs)
      ? section.paragraphs
      : String(section.body || "").split(/\n\s*\n/).filter(Boolean);
    editor.querySelector("[data-story-node-body]").value = paragraphs.join("\n\n");
    editor.querySelector("[data-story-node-month]").addEventListener("change", updateStoryNumbers);
    editor.querySelector("[data-remove-story-node]").addEventListener("click", () => {
      if (!confirm("移除这个时间节点后，保存故事时会同时删除该节点的评论。")) return;
      editor.remove();
      updateStoryNumbers();
    });
    storySectionsRoot.append(fragment);
    updateStoryNumbers();
    refreshIcons();
  };

  const setSectionVisible = (section, visible) => {
    section.hidden = !visible;
    section.querySelectorAll("input, textarea, select, button").forEach((control) => {
      control.disabled = !visible;
    });
  };

  const setKind = (nextKind) => {
    kind = nextKind;
    currentPost = null;
    commentsTab.setAttribute("aria-current", "false");
    growthTab.setAttribute("aria-current", "false");
    document.querySelectorAll("[data-kind-tab]").forEach((tab) => {
      tab.setAttribute("aria-current", tab.dataset.kindTab === kind ? "page" : "false");
    });
    document.querySelector("[data-new-post] span").textContent = `新建${kindLabels[kind]}`;
    contentTitle.textContent = kindLabels[kind];
    contentDescription.textContent = kindDescriptions[kind];
    Object.entries(fieldSections).forEach(([name, section]) => setSectionVisible(section, name === kind));
    const showHappenedAt = kind === "weekly";
    happenedField.hidden = !showHappenedAt;
    postForm.elements.happened_at.disabled = !showHappenedAt;
    renderPostList();
    setMessage(listMessage, "");
    showView("list");
  };

  const commentTargetLabel = (comment) => {
    if (comment.target_kind === "life_image") return `生活相册 · ${comment.target_key}`;
    if (comment.target_kind === "story_node" || comment.target_kind === "robomaster_node") {
      return `故事节点 · ${comment.target_key.replace("-", ".")}`;
    }
    return { about: "关于我", interests: "兴趣爱好" }[comment.target_key] || comment.target_key;
  };

  const renderComments = (comments) => {
    if (!comments.length) {
      commentsList.innerHTML = '<p class="admin-empty">还没有公开评论。</p>';
      return;
    }
    const byId = new Map(comments.map((comment) => [comment.id, comment]));
    const tableWrap = document.createElement("div");
    tableWrap.className = "admin-table-wrap";
    const table = document.createElement("table");
    table.className = "admin-table admin-comments-table";
    table.innerHTML = "<thead><tr><th>用户</th><th>位置</th><th>留言内容</th><th>发表时间</th><th><span class=\"admin-visually-hidden\">操作</span></th></tr></thead>";
    const tbody = document.createElement("tbody");
    comments.forEach((comment) => {
      const row = document.createElement("tr");
      const authorCell = document.createElement("td");
      const nickname = document.createElement("strong");
      nickname.textContent = comment.nickname;
      authorCell.append(nickname);
      const targetCell = document.createElement("td");
      const target = document.createElement("span");
      target.textContent = commentTargetLabel(comment);
      targetCell.append(target);
      const bodyCell = document.createElement("td");
      bodyCell.className = "admin-comment-body";
      const body = document.createElement("p");
      const parent = comment.parent_id ? byId.get(comment.parent_id) : null;
      body.textContent = parent ? `回复 ${parent.nickname}：${comment.body}` : comment.body;
      bodyCell.append(body);
      const timeCell = document.createElement("td");
      const time = document.createElement("time");
      time.dateTime = comment.created_at;
      time.textContent = new Date(comment.created_at).toLocaleString("zh-CN", { hour12: false });
      timeCell.append(time);
      const actionCell = document.createElement("td");
      actionCell.className = "admin-table-action";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "admin-table-button admin-danger";
      remove.textContent = "删除";
      remove.addEventListener("click", async () => {
        const warning = comment.parent_id ? "确定删除这条回复吗？" : "确定删除这条评论吗？它下面的回复也会一起删除。";
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
      actionCell.append(remove);
      row.append(authorCell, targetCell, bodyCell, timeCell, actionCell);
      tbody.append(row);
    });
    table.append(tbody);
    tableWrap.append(table);
    commentsList.replaceChildren(tableWrap);
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
    document.querySelectorAll("[data-kind-tab]").forEach((tab) => tab.setAttribute("aria-current", "false"));
    growthTab.setAttribute("aria-current", "false");
    commentsTab.setAttribute("aria-current", "page");
    showView("comments");
    await loadComments();
  };

  const showGrowth = () => {
    document.querySelectorAll("[data-kind-tab]").forEach((tab) => tab.setAttribute("aria-current", "false"));
    commentsTab.setAttribute("aria-current", "false");
    growthTab.setAttribute("aria-current", "page");
    showView("growth");
    document.dispatchEvent(new CustomEvent("admin:growth-open"));
  };

  const resetEditor = () => {
    currentPost = null;
    removedPaths = [];
    postForm.reset();
    postForm.elements.id.value = "";
    postForm.elements.status.value = "draft";
    postForm.elements.happened_at.value = toLocalInput();
    postForm.elements.photo_date.value = toDateInput();
    document.querySelector("[data-editor-kicker]").textContent = `新建${kindLabels[kind]}`;
    document.querySelector("[data-editor-title]").textContent = "尚未保存";
    document.querySelector("[data-delete-post]").hidden = true;
    document.querySelector("[data-story-existing-cover]").replaceChildren();
    document.querySelector("[data-photo-existing-image]").replaceChildren();
    weeklySectionsRoot.replaceChildren();
    storySectionsRoot.replaceChildren();
    if (kind === "weekly") addWeeklySection();
    if (kind === "story") addStorySection();
    setMessage(saveMessage, "");
    renderPostList();
    showView("editor");
    refreshIcons();
  };

  const editPost = (post) => {
    if (post.kind !== kind) {
      kind = post.kind;
      document.querySelectorAll("[data-kind-tab]").forEach((tab) => {
        tab.setAttribute("aria-current", tab.dataset.kindTab === kind ? "page" : "false");
      });
      Object.entries(fieldSections).forEach(([name, section]) => setSectionVisible(section, name === kind));
      const showHappenedAt = kind === "weekly";
      happenedField.hidden = !showHappenedAt;
      postForm.elements.happened_at.disabled = !showHappenedAt;
    }
    currentPost = post;
    removedPaths = [];
    postForm.elements.id.value = post.id;
    postForm.elements.status.value = post.status;
    postForm.elements.happened_at.value = toLocalInput(post.happened_at);
    postForm.elements.photo_date.value = toDateInput(post.happened_at);
    postForm.elements.title.value = post.title || "";
    postForm.elements.story_title.value = post.title || "";
    postForm.elements.story_summary.value = post.body || "";
    postForm.elements.photo_title.value = post.title || "";
    postForm.elements.photo_body.value = post.body || "";
    document.querySelector("[data-editor-kicker]").textContent = `编辑${kindLabels[post.kind]}`;
    document.querySelector("[data-editor-title]").textContent = post.title || post.body?.slice(0, 30) || "未命名";
    document.querySelector("[data-delete-post]").hidden = false;

    document.querySelector("[data-story-existing-cover]").replaceChildren(
      ...(post.kind === "story" ? (post.images || []).slice(0, 1) : []).map((image) => makeImageChip(image)),
    );
    document.querySelector("[data-photo-existing-image]").replaceChildren(
      ...(post.kind === "photo" ? (post.images || []).slice(0, 1) : []).map((image) => makeImageChip(image)),
    );

    weeklySectionsRoot.replaceChildren();
    storySectionsRoot.replaceChildren();
    if (post.kind === "weekly") {
      (post.sections || []).forEach(addWeeklySection);
      if (!(post.sections || []).length) addWeeklySection();
    }
    if (post.kind === "story") {
      [...(post.sections || [])]
        .sort((a, b) => String(a.month || "").localeCompare(String(b.month || "")))
        .forEach(addStorySection);
      if (!(post.sections || []).length) addStorySection();
    }
    setMessage(saveMessage, "");
    renderPostList();
    showView("editor");
    refreshIcons();
  };

  const sortedPosts = () => posts
    .filter((post) => post.kind === kind)
    .sort((a, b) => kind === "story"
      ? Number(a.sort_order || 0) - Number(b.sort_order || 0) || new Date(a.happened_at) - new Date(b.happened_at)
      : new Date(b.happened_at) - new Date(a.happened_at));

  const persistStoryOrder = async (ordered) => {
    setMessage(listMessage, "正在保存顺序...");
    const results = await Promise.all(ordered.map((post, index) => client
      .from("posts")
      .update({ sort_order: index })
      .eq("id", post.id)
      .select("id")));
    const failure = results.find(({ error, data }) => error || !data?.length);
    if (failure) {
      setMessage(listMessage, failure.error?.message || "故事顺序没有写入数据库，请先执行最新 setup.sql", "error");
      await loadPosts();
      return;
    }
    ordered.forEach((post, index) => { post.sort_order = index; });
    setMessage(listMessage, "故事顺序已保存", "success");
    renderPostList();
  };

  const postTitle = (post) => post.title || post.body?.slice(0, 48) || "未命名";

  const formatTableDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const makePostRow = (post, draggable = false) => {
    const row = document.createElement("tr");
    row.dataset.postId = post.id;
    if (currentPost?.id === post.id) row.classList.add("is-active");

    if (draggable) {
      row.draggable = true;
      const dragCell = document.createElement("td");
      dragCell.className = "admin-drag-cell";
      const handle = document.createElement("span");
      handle.className = "admin-drag-handle";
      handle.textContent = "⋮⋮";
      handle.setAttribute("aria-label", "拖动调整顺序");
      dragCell.append(handle);
      row.append(dragCell);
      row.addEventListener("dragstart", () => {
        draggedStoryId = post.id;
        row.classList.add("is-dragging");
      });
      row.addEventListener("dragend", () => row.classList.remove("is-dragging"));
      row.addEventListener("dragover", (event) => event.preventDefault());
      row.addEventListener("drop", async (event) => {
        event.preventDefault();
        if (!draggedStoryId || draggedStoryId === post.id) return;
        const reordered = sortedPosts();
        const from = reordered.findIndex((item) => item.id === draggedStoryId);
        const to = reordered.findIndex((item) => item.id === post.id);
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        draggedStoryId = "";
        reordered.forEach((item, index) => { item.sort_order = index; });
        renderPostList();
        await persistStoryOrder(reordered);
      });
    }

    const titleCell = document.createElement("td");
    titleCell.className = "admin-title-cell";
    const titleButton = document.createElement("button");
    titleButton.type = "button";
    titleButton.className = "admin-table-title";
    titleButton.textContent = postTitle(post);
    titleButton.addEventListener("click", () => editPost(post));
    titleCell.append(titleButton);

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = `admin-status admin-status-${post.status}`;
    status.textContent = { draft: "草稿", published: "公开", hidden: "隐藏" }[post.status] || post.status;
    statusCell.append(status);

    const happenedCell = document.createElement("td");
    happenedCell.textContent = formatTableDate(post.happened_at);
    const updatedCell = document.createElement("td");
    updatedCell.textContent = formatTableDate(post.updated_at || post.created_at || post.happened_at);

    const actionCell = document.createElement("td");
    actionCell.className = "admin-table-action";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "admin-table-button";
    edit.textContent = "编辑";
    edit.addEventListener("click", () => editPost(post));
    actionCell.append(edit);
    row.append(titleCell, statusCell, happenedCell, updatedCell, actionCell);
    row.addEventListener("click", (event) => {
      if (!event.target.closest("button")) editPost(post);
    });
    return row;
  };

  const renderPostList = () => {
    const visible = sortedPosts();
    contentCount.textContent = `${visible.length} 条内容`;
    if (!visible.length) {
      postList.innerHTML = `<div class="admin-empty-state"><strong>还没有${kindLabels[kind]}</strong><span>点击右上角的新建按钮开始记录。</span></div>`;
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "admin-table-wrap";
    const table = document.createElement("table");
    table.className = "admin-table";
    const dragHeading = kind === "story" ? '<th class="admin-drag-cell"><span class="admin-visually-hidden">排序</span></th>' : "";
    table.innerHTML = `<thead><tr>${dragHeading}<th>标题</th><th>状态</th><th>日期</th><th>最后更新</th><th><span class="admin-visually-hidden">操作</span></th></tr></thead>`;
    const tbody = document.createElement("tbody");
    visible.forEach((post) => tbody.append(makePostRow(post, kind === "story")));
    table.append(tbody);
    wrapper.append(table);
    if (kind === "story") {
      const note = document.createElement("p");
      note.className = "admin-sort-note";
      note.textContent = "拖动左侧手柄可以调整故事在公开列表中的顺序。";
      postList.replaceChildren(note, wrapper);
    } else {
      postList.replaceChildren(wrapper);
    }
  };

  const loadPosts = async () => {
    const { data, error } = await client.from("posts").select("*").order("happened_at", { ascending: false });
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
      pendingUploadPaths.push(path);
      const { data } = client.storage.from(store.config.storageBucket || "content-media").getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, path });
    }
    return uploaded;
  };

  const collectWeeklySections = async (userId) => {
    const result = [];
    for (const [index, editor] of [...weeklySectionsRoot.querySelectorAll("[data-section-editor]")].entries()) {
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

  const collectStorySections = () => [...storySectionsRoot.querySelectorAll("[data-story-node]")]
    .map((editor) => {
      const body = editor.querySelector("[data-story-node-body]").value.trim();
      return {
        key: editor.dataset.nodeKey,
        month: editor.querySelector("[data-story-node-month]").value,
        heading: editor.querySelector("[data-story-node-heading]").value.trim(),
        paragraphs: body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  const collectSingleImage = async (strip, input, folder) => {
    const existing = readExistingImages(strip).slice(0, 1);
    const file = input.files?.[0];
    if (!file) return existing[0] || null;
    existing.forEach((image) => {
      if (image.path) removedPaths.push(image.path);
    });
    const uploaded = await uploadFiles([file], folder);
    return uploaded[0] || null;
  };

  const publishedAt = (status) => status === "published"
    ? (currentPost?.published_at || new Date().toISOString())
    : currentPost?.published_at || null;

  const savePost = async (event) => {
    event.preventDefault();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const submit = postForm.querySelector('[type="submit"]');
    submit.disabled = true;
    pendingUploadPaths = [];
    setMessage(saveMessage, "正在保存...");
    try {
      const status = postForm.elements.status.value;
      let payload;
      if (kind === "weekly") {
        const title = postForm.elements.title.value.trim();
        if (!title) throw new Error("请填写周报标题");
        const sections = await collectWeeklySections(user.id);
        if (!sections.length || sections.some((section) => !section.heading)) throw new Error("每个周报段落都需要小标题");
        payload = {
          kind,
          slug: currentPost?.slug || postForm.elements.happened_at.value.slice(0, 10),
          title,
          body: "",
          sections,
          images: [],
          status,
          happened_at: new Date(postForm.elements.happened_at.value).toISOString(),
          published_at: publishedAt(status),
          sort_order: 0,
        };
      } else if (kind === "story") {
        const title = postForm.elements.story_title.value.trim();
        const body = postForm.elements.story_summary.value.trim();
        const sections = collectStorySections();
        const cover = await collectSingleImage(
          document.querySelector("[data-story-existing-cover]"),
          postForm.elements.story_cover,
          `story/${user.id}`,
        );
        if (status === "published") {
          if (!title) throw new Error("公开故事前请填写标题");
          if (!cover) throw new Error("公开故事前请添加封面");
          if (!sections.length) throw new Error("公开故事前请至少添加一个时间节点");
          if (sections.some((section) => !section.month || !section.heading || !section.paragraphs.length)) {
            throw new Error("公开故事的每个节点都需要年月、标题和正文");
          }
        }
        const firstMonth = sections.find((section) => section.month)?.month;
        const nextOrder = Math.max(-1, ...posts.filter((post) => post.kind === "story").map((post) => Number(post.sort_order || 0))) + 1;
        payload = {
          kind,
          slug: currentPost?.slug || `story-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
          title,
          body,
          sections,
          images: cover ? [cover] : [],
          status,
          happened_at: firstMonth
            ? new Date(`${firstMonth}-01T12:00:00`).toISOString()
            : currentPost?.happened_at || new Date().toISOString(),
          published_at: publishedAt(status),
          sort_order: currentPost?.sort_order ?? nextOrder,
        };
      } else {
        const title = postForm.elements.photo_title.value.trim();
        const body = postForm.elements.photo_body.value.trim();
        const date = postForm.elements.photo_date.value;
        const image = await collectSingleImage(
          document.querySelector("[data-photo-existing-image]"),
          postForm.elements.photo_image,
          `photo/${user.id}`,
        );
        if (status === "published" && (!date || !title || !image)) {
          throw new Error("公开照片前请填写日期、标题并上传照片");
        }
        payload = {
          kind,
          slug: currentPost?.slug || `photo-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
          title,
          body,
          sections: [],
          images: image ? [image] : [],
          status,
          happened_at: date
            ? new Date(`${date}T12:00:00`).toISOString()
            : currentPost?.happened_at || new Date().toISOString(),
          published_at: publishedAt(status),
          sort_order: currentPost?.sort_order || 0,
        };
      }

      const query = currentPost
        ? client.from("posts").update(payload).eq("id", currentPost.id)
        : client.from("posts").insert(payload);
      const { data, error } = await query.select("*");
      if (error) throw error;
      if (!data?.length) throw new Error("数据库没有更新任何记录，请检查管理员 RLS 权限后重试");

      let cleanupFailed = false;
      if (removedPaths.length) {
        const { error: cleanupError } = await client.storage
          .from(store.config.storageBucket || "content-media")
          .remove([...new Set(removedPaths)]);
        cleanupFailed = Boolean(cleanupError);
      }
      pendingUploadPaths = [];
      setMessage(saveMessage, cleanupFailed ? "内容已保存，但旧图片清理失败" : "已保存", cleanupFailed ? "error" : "success");
      await loadPosts();
      editPost(data[0]);
    } catch (error) {
      if (pendingUploadPaths.length) {
        await client.storage.from(store.config.storageBucket || "content-media").remove(pendingUploadPaths);
      }
      pendingUploadPaths = [];
      setMessage(saveMessage, error.message || "保存失败", "error");
    } finally {
      submit.disabled = false;
    }
  };

  const deletePost = async () => {
    if (!currentPost || !confirm(`确定删除这条${kindLabels[currentPost.kind]}吗？相关图片和评论也会一起删除，且无法恢复。`)) return;
    const paths = allPostImages(currentPost).map((image) => image.path).filter(Boolean);
    const { data, error } = await client.from("posts").delete().eq("id", currentPost.id).select("id");
    if (error || !data?.length) {
      setMessage(saveMessage, error?.message || "数据库没有删除任何记录，请检查管理员权限", "error");
      return;
    }
    if (paths.length) {
      const { error: storageError } = await client.storage.from(store.config.storageBucket || "content-media").remove(paths);
      if (storageError) setMessage(saveMessage, "内容已删除，但图片文件清理失败", "error");
    }
    await loadPosts();
    currentPost = null;
    renderPostList();
    setMessage(listMessage, `${kindLabels[kind]}已删除`, "success");
    showView("list");
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
    showGrowth();
    refreshIcons();
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
    closeSidebar();
    showLogin();
  });
  document.querySelectorAll("[data-kind-tab]").forEach((tab) => {
    tab.addEventListener("click", () => setKind(tab.dataset.kindTab));
  });
  growthTab.addEventListener("click", showGrowth);
  commentsTab.addEventListener("click", showComments);
  document.querySelector("[data-refresh-comments]").addEventListener("click", loadComments);
  document.querySelector("[data-new-post]").addEventListener("click", resetEditor);
  document.querySelector("[data-back-to-list]").addEventListener("click", () => {
    currentPost = null;
    renderPostList();
    showView("list");
  });
  sidebarToggle.addEventListener("click", () => {
    const open = !studio.classList.contains("is-sidebar-open");
    studio.classList.toggle("is-sidebar-open", open);
    sidebarToggle.setAttribute("aria-expanded", String(open));
    sidebarOverlay.hidden = !open;
  });
  sidebarOverlay.addEventListener("click", closeSidebar);
  document.querySelector("[data-add-weekly-section]").addEventListener("click", () => addWeeklySection());
  document.querySelector("[data-add-story-section]").addEventListener("click", () => addStorySection());
  document.querySelector("[data-delete-post]").addEventListener("click", deletePost);
  postForm.addEventListener("submit", savePost);

  Object.entries(fieldSections).forEach(([name, section]) => setSectionVisible(section, name === kind));
  refreshIcons();
  client.auth.getSession().then(({ data }) => {
    if (data.session) showStudio(data.session);
    else showLogin();
  });
})();
