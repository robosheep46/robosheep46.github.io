(() => {
  const store = window.contentStore;
  const roots = [...document.querySelectorAll("[data-comments]")];
  if (!roots.length) return;

  const SUBMIT_DELAY = 15000;
  const LAST_SUBMIT_KEY = "robosheep-comment-last-submit";
  const VISITOR_KEY = "robosheep-comment-visitor";
  const NICKNAME_KEY = "robosheep-comment-nickname";
  const accountListeners = new Set();
  let authState = { session: null, user: null, profile: null };
  let claimPromise = null;

  const escapeText = (value) => String(value ?? "");
  const formatTime = (value) => new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value)).replaceAll("/", ".");

  const makeVisitorToken = () => {
    try {
      let token = localStorage.getItem(VISITOR_KEY);
      if (!token) {
        token = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, token);
      }
      return token;
    } catch {
      return crypto.randomUUID();
    }
  };

  const visitorToken = makeVisitorToken();

  const getRememberedNickname = () => {
    try {
      return localStorage.getItem(NICKNAME_KEY)?.trim() || "";
    } catch {
      return "";
    }
  };

  let rememberedNickname = getRememberedNickname();

  const rememberNickname = (nickname) => {
    rememberedNickname = nickname;
    try {
      localStorage.setItem(NICKNAME_KEY, nickname);
    } catch {
      // Keep the nickname for the current page when storage is unavailable.
    }
  };

  const secondsUntilNextSubmit = () => {
    try {
      const last = Number(localStorage.getItem(LAST_SUBMIT_KEY) || 0);
      return Math.max(0, Math.ceil((SUBMIT_DELAY - (Date.now() - last)) / 1000));
    } catch {
      return 0;
    }
  };

  const rememberSubmit = () => {
    try {
      localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
    } catch {
      // The database still applies its own submission interval.
    }
  };

  const refreshAuthState = async ({ claim = false, notify = true } = {}) => {
    try {
      authState = await store.getAuthState();
      if (claim && authState.user) {
        claimPromise ||= store.claimVisitorComments(visitorToken).catch((error) => {
          console.warn("Unable to claim guest comments.", error);
        });
        await claimPromise;
      }
    } catch (error) {
      console.warn("Unable to read account state.", error);
      authState = { session: null, user: null, profile: null };
    }
    if (notify) accountListeners.forEach((listener) => listener(authState));
    return authState;
  };

  const authReady = store?.configured
    ? refreshAuthState({ claim: true, notify: false })
    : Promise.resolve(authState);

  const accountUrl = (() => {
    const scriptUrl = new URL(document.currentScript?.src || location.href, location.href);
    const url = new URL("./account.html", scriptUrl);
    url.searchParams.set("return", location.href);
    return url.href;
  })();

  const avatarTone = (nickname) => [...nickname].reduce((total, character) => (
    total + character.codePointAt(0)
  ), 0) % 5;

  const createAvatar = (nickname, avatarUrl = "") => {
    const avatar = document.createElement("span");
    avatar.className = `comment-avatar comment-avatar-${avatarTone(nickname)}`;
    if (avatarUrl) {
      const image = document.createElement("img");
      image.src = avatarUrl;
      image.alt = "";
      image.referrerPolicy = "no-referrer";
      avatar.append(image);
    } else {
      avatar.textContent = [...nickname.trim()][0]?.toUpperCase() || "访";
    }
    avatar.setAttribute("aria-hidden", "true");
    return avatar;
  };

  const createMeta = (comment, isOwn) => {
    const meta = document.createElement("header");
    const nickname = document.createElement("strong");
    nickname.textContent = escapeText(comment.nickname);
    meta.append(nickname);
    if (isOwn) {
      const badge = document.createElement("span");
      badge.className = "comment-own-badge";
      badge.textContent = "我的留言";
      meta.append(badge);
    }
    const time = document.createElement("time");
    time.dateTime = comment.created_at;
    time.textContent = formatTime(comment.created_at);
    meta.append(time);
    return meta;
  };

  const createDeleteButton = (comment, hasReplies, onDelete) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "comment-delete-button";
    button.textContent = "删除";
    button.addEventListener("click", () => onDelete(comment, hasReplies));
    return button;
  };

  const createCommentNode = (comment, replies, ownedIds, onReply, onDelete) => {
    const article = document.createElement("article");
    article.className = "comment-item";
    article.dataset.commentId = comment.id;
    const isOwn = ownedIds.has(comment.id);
    const content = document.createElement("div");
    content.className = "comment-content";
    const bubble = document.createElement("div");
    bubble.className = "comment-bubble";
    const body = document.createElement("p");
    body.textContent = escapeText(comment.body);
    const actions = document.createElement("div");
    actions.className = "comment-actions";
    const reply = document.createElement("button");
    reply.type = "button";
    reply.className = "comment-reply-button";
    reply.textContent = "回复";
    reply.addEventListener("click", () => onReply(comment));
    actions.append(reply);
    if (isOwn) actions.append(createDeleteButton(comment, replies.length > 0, onDelete));
    bubble.append(createMeta(comment, isOwn), body, actions);
    content.append(bubble);

    if (replies.length) {
      const group = document.createElement("div");
      group.className = "comment-replies";
      replies.forEach((item) => {
        const child = document.createElement("article");
        child.className = "comment-item comment-item-reply";
        child.dataset.commentId = item.id;
        const childIsOwn = ownedIds.has(item.id);
        const childContent = document.createElement("div");
        childContent.className = "comment-content";
        const childBubble = document.createElement("div");
        childBubble.className = "comment-bubble";
        const childBody = document.createElement("p");
        childBody.textContent = escapeText(item.body);
        childBubble.append(createMeta(item, childIsOwn), childBody);
        if (childIsOwn) {
          const childActions = document.createElement("div");
          childActions.className = "comment-actions";
          childActions.append(createDeleteButton(item, false, onDelete));
          childBubble.append(childActions);
        }
        childContent.append(childBubble);
        child.append(createAvatar(item.nickname, item.avatar_url), childContent);
        group.append(child);
      });
      content.append(group);
    }
    article.append(createAvatar(comment.nickname, comment.avatar_url), content);
    return article;
  };

  const mount = (root) => {
    const targetKind = root.dataset.commentKind;
    const targetKey = root.dataset.commentKey;
    let comments = [];
    let ownedIds = new Set();
    let replyTo = null;
    let publishing = false;

    root.innerHTML = `
      <div class="comments-head">
        <div><span>COMMENTS</span><h2>留言</h2></div>
        <div class="comments-head-status">
          <span class="comments-count" data-comments-count>0 条</span>
          <div class="comment-account" data-comment-account></div>
        </div>
      </div>
      <div class="comments-list" data-comments-list><p class="comments-state">正在读取留言...</p></div>
      <form class="comment-form" data-comment-form>
        <div class="comment-replying" data-comment-replying hidden>
          <span></span><button type="button" aria-label="取消回复">取消</button>
        </div>
        <label class="comment-body"><span>留言</span><textarea name="body" maxlength="500" rows="4" placeholder="写下想说的话" required></textarea></label>
        <label class="comment-honeypot" aria-hidden="true">网站<input name="website" tabindex="-1" autocomplete="off" /></label>
        <div class="comment-form-foot">
          <small><span data-comment-length>0</span>/500</small>
          <button type="submit">发表</button>
        </div>
        <p class="comment-message" data-comment-message aria-live="polite"></p>
      </form>
      <dialog class="comment-nickname-dialog" data-nickname-dialog>
        <form method="dialog" data-nickname-form>
          <header><span>第一次留言</span><h3>想怎样称呼你？</h3></header>
          <label><span>显示昵称</span><input name="nickname" maxlength="20" autocomplete="nickname" required /></label>
          <p data-nickname-message aria-live="polite"></p>
          <div>
            <button type="button" data-nickname-cancel>取消</button>
            <button type="submit">继续发表</button>
          </div>
        </form>
      </dialog>`;

    const list = root.querySelector("[data-comments-list]");
    const count = root.querySelector("[data-comments-count]");
    const account = root.querySelector("[data-comment-account]");
    const form = root.querySelector("[data-comment-form]");
    const message = root.querySelector("[data-comment-message]");
    const replying = root.querySelector("[data-comment-replying]");
    const textarea = form.elements.body;
    const length = root.querySelector("[data-comment-length]");
    const nicknameDialog = root.querySelector("[data-nickname-dialog]");
    const nicknameForm = root.querySelector("[data-nickname-form]");
    const nicknameMessage = root.querySelector("[data-nickname-message]");

    const setMessage = (text, tone = "") => {
      message.textContent = text;
      message.dataset.tone = tone;
    };

    const setReply = (comment) => {
      replyTo = comment;
      replying.hidden = !comment;
      replying.querySelector("span").textContent = comment ? `回复 ${comment.nickname}` : "";
      if (comment) textarea.focus();
    };

    const renderAccount = () => {
      account.replaceChildren();
      if (!authState.user) {
        const login = document.createElement("a");
        login.href = accountUrl;
        login.textContent = "登录";
        account.append(login);
        return;
      }
      const nickname = authState.profile?.nickname
        || authState.user.user_metadata?.nickname
        || authState.user.user_metadata?.user_name
        || "已登录";
      const identity = document.createElement("a");
      identity.className = "comment-account-identity";
      identity.href = accountUrl;
      identity.append(createAvatar(nickname, authState.profile?.avatar_url || authState.user.user_metadata?.avatar_url || ""));
      const name = document.createElement("span");
      name.textContent = nickname;
      identity.append(name);
      const signOut = document.createElement("button");
      signOut.type = "button";
      signOut.textContent = "退出";
      signOut.addEventListener("click", async () => {
        signOut.disabled = true;
        await store.client.auth.signOut();
        claimPromise = null;
        await refreshAuthState();
      });
      account.append(identity, signOut);
    };

    replying.querySelector("button").addEventListener("click", () => setReply(null));
    textarea.addEventListener("input", () => {
      length.textContent = String(textarea.value.length);
    });

    const render = () => {
      count.textContent = `${comments.length} 条`;
      if (!comments.length) {
        list.innerHTML = '<p class="comments-state">还没有留言，来留下第一句话吧。</p>';
        return;
      }
      const rootComments = comments.filter((comment) => !comment.parent_id);
      list.replaceChildren(...rootComments.map((comment) => createCommentNode(
        comment,
        comments.filter((item) => item.parent_id === comment.id),
        ownedIds,
        setReply,
        deleteComment,
      )));
    };

    const deleteComment = async (comment, hasReplies) => {
      const prompt = hasReplies
        ? "删除这条留言后，下面的回复也会一起删除。确定继续吗？"
        : "确定删除这条留言吗？";
      if (!confirm(prompt)) return;
      setMessage("正在删除...");
      try {
        await store.deleteOwnComment(comment.id, visitorToken);
        if (replyTo?.id === comment.id || replyTo?.parent_id === comment.id) setReply(null);
        await load();
        setMessage("已删除", "success");
      } catch (error) {
        setMessage(error?.message || "删除失败，请稍后再试", "error");
      }
    };

    const load = async () => {
      if (!store?.configured) {
        list.innerHTML = '<p class="comments-state">留言功能暂未开放。</p>';
        form.hidden = true;
        return;
      }
      await authReady;
      renderAccount();
      try {
        const [nextComments, nextOwnedIds] = await Promise.all([
          store.listComments(targetKind, targetKey),
          store.listOwnedCommentIds(visitorToken),
        ]);
        comments = nextComments;
        ownedIds = new Set(nextOwnedIds);
        render();
      } catch (error) {
        console.warn("Unable to load comments.", error);
        list.innerHTML = '<p class="comments-state">留言暂时无法读取，请稍后再试。</p>';
      }
    };

    const publish = async () => {
      if (publishing) return;
      setMessage("");
      if (form.elements.website.value) return;
      const body = textarea.value.trim();
      if (!body) {
        setMessage("请先写下留言", "error");
        textarea.focus();
        return;
      }
      const wait = secondsUntilNextSubmit();
      if (wait) {
        setMessage(`请等待 ${wait} 秒后再发表`, "error");
        return;
      }
      if (!authState.user && !rememberedNickname) {
        nicknameMessage.textContent = "";
        nicknameForm.elements.nickname.value = "";
        nicknameDialog.showModal();
        nicknameForm.elements.nickname.focus();
        return;
      }

      const nickname = authState.profile?.nickname
        || authState.user?.user_metadata?.nickname
        || authState.user?.user_metadata?.user_name
        || rememberedNickname;
      const submit = form.querySelector('[type="submit"]');
      publishing = true;
      submit.disabled = true;
      setMessage("正在发表...");
      try {
        await store.createComment({
          target_kind: targetKind,
          target_key: targetKey,
          nickname,
          body,
          parent_id: replyTo?.id || null,
          visitor_token: visitorToken,
        });
        rememberSubmit();
        textarea.value = "";
        length.textContent = "0";
        setReply(null);
        await load();
        setMessage("已发表", "success");
      } catch (error) {
        const detail = error?.message || "发表失败，请稍后再试";
        setMessage(detail.includes("comments") ? "评论服务尚未完成初始化" : detail, "error");
      } finally {
        publishing = false;
        submit.disabled = false;
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await publish();
    });

    nicknameForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const nickname = nicknameForm.elements.nickname.value.trim();
      if (!nickname) {
        nicknameMessage.textContent = "请填写昵称";
        return;
      }
      rememberNickname(nickname);
      nicknameDialog.close();
      await publish();
    });

    root.querySelector("[data-nickname-cancel]").addEventListener("click", () => nicknameDialog.close());
    accountListeners.add(async () => {
      renderAccount();
      await load();
    });
    load();
  };

  roots.forEach(mount);
})();
