(() => {
  const store = window.contentStore;
  const roots = [...document.querySelectorAll("[data-comments]")];
  if (!roots.length) return;

  const SUBMIT_DELAY = 15000;
  const LAST_SUBMIT_KEY = "robosheep-comment-last-submit";
  const VISITOR_KEY = "robosheep-comment-visitor";

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

  const createCommentNode = (comment, replies, onReply) => {
    const article = document.createElement("article");
    article.className = "comment-item";
    article.dataset.commentId = comment.id;

    const meta = document.createElement("header");
    const nickname = document.createElement("strong");
    nickname.textContent = escapeText(comment.nickname);
    const time = document.createElement("time");
    time.dateTime = comment.created_at;
    time.textContent = formatTime(comment.created_at);
    meta.append(nickname, time);

    const body = document.createElement("p");
    body.textContent = escapeText(comment.body);
    const reply = document.createElement("button");
    reply.type = "button";
    reply.className = "comment-reply-button";
    reply.textContent = "回复";
    reply.addEventListener("click", () => onReply(comment));
    article.append(meta, body, reply);

    if (replies.length) {
      const group = document.createElement("div");
      group.className = "comment-replies";
      replies.forEach((item) => {
        const child = document.createElement("article");
        child.className = "comment-item comment-item-reply";
        const childMeta = document.createElement("header");
        const childNickname = document.createElement("strong");
        childNickname.textContent = escapeText(item.nickname);
        const childTime = document.createElement("time");
        childTime.dateTime = item.created_at;
        childTime.textContent = formatTime(item.created_at);
        childMeta.append(childNickname, childTime);
        const childBody = document.createElement("p");
        childBody.textContent = escapeText(item.body);
        child.append(childMeta, childBody);
        group.append(child);
      });
      article.append(group);
    }
    return article;
  };

  const mount = (root) => {
    const targetKind = root.dataset.commentKind;
    const targetKey = root.dataset.commentKey;
    let comments = [];
    let replyTo = null;

    root.innerHTML = `
      <div class="comments-head">
        <div><span>COMMENTS</span><h2>留言</h2></div>
        <span class="comments-count" data-comments-count>0 条</span>
      </div>
      <div class="comments-list" data-comments-list><p class="comments-state">正在读取留言...</p></div>
      <form class="comment-form" data-comment-form>
        <div class="comment-replying" data-comment-replying hidden>
          <span></span><button type="button" aria-label="取消回复">取消</button>
        </div>
        <label class="comment-nickname"><span>昵称</span><input name="nickname" maxlength="20" autocomplete="nickname" required /></label>
        <label class="comment-body"><span>留言</span><textarea name="body" maxlength="500" rows="4" required></textarea></label>
        <label class="comment-honeypot" aria-hidden="true">网站<input name="website" tabindex="-1" autocomplete="off" /></label>
        <div class="comment-form-foot">
          <small><span data-comment-length>0</span>/500</small>
          <button type="submit">发表</button>
        </div>
        <p class="comment-message" data-comment-message aria-live="polite"></p>
      </form>`;

    const list = root.querySelector("[data-comments-list]");
    const count = root.querySelector("[data-comments-count]");
    const form = root.querySelector("[data-comment-form]");
    const message = root.querySelector("[data-comment-message]");
    const replying = root.querySelector("[data-comment-replying]");
    const textarea = form.elements.body;
    const length = root.querySelector("[data-comment-length]");

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
      const roots = comments.filter((comment) => !comment.parent_id);
      list.replaceChildren(...roots.map((comment) => createCommentNode(
        comment,
        comments.filter((item) => item.parent_id === comment.id),
        setReply,
      )));
    };

    const load = async () => {
      if (!store?.configured) {
        list.innerHTML = '<p class="comments-state">留言功能暂未开放。</p>';
        form.hidden = true;
        return;
      }
      try {
        comments = await store.listComments(targetKind, targetKey);
        render();
      } catch (error) {
        console.warn("Unable to load comments.", error);
        list.innerHTML = '<p class="comments-state">留言暂时无法读取，请稍后再试。</p>';
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage("");
      if (form.elements.website.value) return;
      const wait = secondsUntilNextSubmit();
      if (wait) {
        setMessage(`请等待 ${wait} 秒后再发表`, "error");
        return;
      }

      const nickname = form.elements.nickname.value.trim();
      const body = textarea.value.trim();
      if (!nickname || !body) {
        setMessage("请填写昵称和留言", "error");
        return;
      }

      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      setMessage("正在发表...");
      try {
        await store.createComment({
          target_kind: targetKind,
          target_key: targetKey,
          nickname,
          body,
          parent_id: replyTo?.id || null,
          visitor_token: makeVisitorToken(),
        });
        comments = await store.listComments(targetKind, targetKey);
        rememberSubmit();
        textarea.value = "";
        length.textContent = "0";
        setReply(null);
        setMessage("已发表", "success");
        render();
      } catch (error) {
        const detail = error?.message || "发表失败，请稍后再试";
        setMessage(detail.includes("comments") ? "评论服务尚未完成初始化" : detail, "error");
      } finally {
        submit.disabled = false;
      }
    });

    load();
  };

  roots.forEach(mount);
})();
