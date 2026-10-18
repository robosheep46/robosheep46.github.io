(() => {
  const store = window.contentStore;
  const client = store?.client;
  const authPanel = document.querySelector("[data-auth-panel]");
  const sessionPanel = document.querySelector("[data-session-panel]");
  const title = document.querySelector("[data-auth-title]");
  const tabs = document.querySelector("[data-auth-tabs]");
  const loginForm = document.querySelector("[data-login-form]");
  const registerForm = document.querySelector("[data-register-form]");
  const recoveryForm = document.querySelector("[data-recovery-form]");
  const resetForm = document.querySelector("[data-reset-form]");
  const oauth = document.querySelector("[data-auth-oauth]");
  const message = document.querySelector("[data-auth-message]");
  const params = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.slice(1));
  let visitorToken = null;
  try {
    visitorToken = localStorage.getItem("robosheep-comment-visitor");
  } catch {
    // Guest comments simply remain tied to the original browser.
  }
  let recoveryFlow =
    params.get("mode") === "reset" ||
    params.get("type") === "recovery" ||
    hashParams.get("type") === "recovery";
  let mode = recoveryFlow ? "reset" : "login";
  let redirecting = false;

  const safeReturnUrl = () => {
    const fallback = new URL("./index.html#home-hub", location.href);
    const candidate = params.get("return");
    if (!candidate) return fallback.href;
    try {
      const parsed = new URL(candidate, location.origin);
      return parsed.origin === location.origin ? parsed.href : fallback.href;
    } catch {
      return fallback.href;
    }
  };

  const returnUrl = safeReturnUrl();
  document.querySelectorAll("[data-account-return], [data-session-return]").forEach((link) => {
    link.href = returnUrl;
  });

  const setMessage = (text, tone = "") => {
    message.textContent = text;
    message.dataset.tone = tone;
  };

  const setBusy = (form, busy) => {
    form.querySelectorAll("button, input").forEach((control) => {
      control.disabled = busy;
    });
  };

  const showMode = (nextMode) => {
    mode = nextMode;
    const standard = mode === "login" || mode === "register";
    tabs.hidden = !standard;
    oauth.hidden = !standard;
    loginForm.hidden = mode !== "login";
    registerForm.hidden = mode !== "register";
    recoveryForm.hidden = mode !== "recovery";
    resetForm.hidden = mode !== "reset";
    title.textContent = {
      login: "欢迎回来",
      register: "创建账号",
      recovery: "找回密码",
      reset: "设置新密码",
    }[mode];
    tabs.querySelectorAll("[data-auth-mode]").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.authMode === mode));
    });
    setMessage("");
  };

  const loadProfile = async (user) => {
    const { data, error } = await client
      .from("profiles")
      .select("nickname,avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) console.warn("Unable to read public profile.", error.message);
    return data || {
      nickname: user.user_metadata?.nickname || user.user_metadata?.user_name || user.email?.split("@")[0] || "访客",
      avatar_url: user.user_metadata?.avatar_url || "",
    };
  };

  const claimGuestComments = async () => {
    if (!visitorToken) return;
    try {
      await store.claimVisitorComments(visitorToken);
    } catch (error) {
      console.warn("Unable to claim guest comments.", error);
    }
  };

  const returnAfterSignIn = async () => {
    if (redirecting) return;
    redirecting = true;
    await claimGuestComments();
    location.href = returnUrl;
  };

  const showSession = async (session) => {
    const profile = await loadProfile(session.user);
    authPanel.hidden = true;
    sessionPanel.hidden = false;
    const avatar = document.querySelector("[data-account-avatar]");
    avatar.replaceChildren();
    if (profile.avatar_url) {
      const image = document.createElement("img");
      image.src = profile.avatar_url;
      image.alt = "";
      image.referrerPolicy = "no-referrer";
      avatar.append(image);
    } else {
      avatar.textContent = [...profile.nickname][0]?.toUpperCase() || "访";
    }
    document.querySelector("[data-account-nickname]").textContent = profile.nickname;
    document.querySelector("[data-account-email]").textContent = session.user.email || "GitHub 账号";
  };

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-mode]");
    if (button) showMode(button.dataset.authMode);
  });

  document.querySelector("[data-forgot-password]").addEventListener("click", () => {
    recoveryForm.elements.email.value = loginForm.elements.email.value;
    showMode("recovery");
  });
  document.querySelector("[data-back-login]").addEventListener("click", () => showMode("login"));

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setBusy(loginForm, true);
    setMessage("正在登录...");
    const { error } = await client.auth.signInWithPassword({
      email: loginForm.elements.email.value.trim(),
      password: loginForm.elements.password.value,
    });
    if (error) {
      setMessage(error.message === "Invalid login credentials" ? "邮箱或密码不正确" : error.message, "error");
      setBusy(loginForm, false);
      return;
    }
    setMessage("登录成功", "success");
    await returnAfterSignIn();
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nickname = registerForm.elements.nickname.value.trim();
    if (!nickname) return;
    setBusy(registerForm, true);
    setMessage("正在创建账号...");
    const { data, error } = await client.auth.signUp({
      email: registerForm.elements.email.value.trim(),
      password: registerForm.elements.password.value,
      options: { data: { nickname } },
    });
    if (error) {
      setMessage(error.message, "error");
      setBusy(registerForm, false);
      return;
    }
    if (!data.session) {
      setMessage("请前往邮箱完成注册后再登录", "success");
      setBusy(registerForm, false);
      return;
    }
    setMessage("注册成功", "success");
    await returnAfterSignIn();
  });

  recoveryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setBusy(recoveryForm, true);
    setMessage("正在发送...");
    const resetUrl = new URL("./account.html", location.href);
    resetUrl.searchParams.set("mode", "reset");
    resetUrl.searchParams.set("return", returnUrl);
    const { error } = await client.auth.resetPasswordForEmail(
      recoveryForm.elements.email.value.trim(),
      { redirectTo: resetUrl.href },
    );
    if (error) {
      setMessage(error.message, "error");
    } else {
      setMessage("重置链接已发送，请检查邮箱", "success");
    }
    setBusy(recoveryForm, false);
  });

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = resetForm.elements.password.value;
    if (password !== resetForm.elements.confirm_password.value) {
      setMessage("两次输入的密码不一致", "error");
      return;
    }
    setBusy(resetForm, true);
    setMessage("正在更新密码...");
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      setMessage(error.message, "error");
      setBusy(resetForm, false);
      return;
    }
    setMessage("密码已更新", "success");
    window.setTimeout(() => {
      location.href = returnUrl;
    }, 700);
  });

  document.querySelector("[data-github-login]").addEventListener("click", async () => {
    setMessage("正在前往 GitHub...");
    const callback = new URL("./account.html", location.href);
    callback.searchParams.set("return", returnUrl);
    callback.searchParams.set("oauth", "github");
    const { error } = await client.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: callback.href },
    });
    if (error) setMessage(error.message, "error");
  });

  document.querySelector("[data-account-signout]").addEventListener("click", async () => {
    await client.auth.signOut();
    sessionPanel.hidden = true;
    authPanel.hidden = false;
    showMode("login");
  });

  if (!client) {
    setMessage("账号服务暂未开放", "error");
    authPanel.querySelectorAll("button, input").forEach((control) => {
      control.disabled = true;
    });
    return;
  }

  showMode(mode);
  client.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") recoveryFlow = true;
    window.setTimeout(async () => {
      if (event === "PASSWORD_RECOVERY") {
        authPanel.hidden = false;
        sessionPanel.hidden = true;
        showMode("reset");
        return;
      }
      if (event === "SIGNED_IN" && session && params.get("oauth") && !recoveryFlow) {
        await returnAfterSignIn();
      }
    }, 0);
  });

  client.auth.getSession().then(async ({ data, error }) => {
    if (error) {
      setMessage(error.message, "error");
      return;
    }
    if (recoveryFlow) {
      authPanel.hidden = false;
      sessionPanel.hidden = true;
      showMode("reset");
      return;
    }
    if (data.session) {
      if (params.get("oauth")) await returnAfterSignIn();
      else await showSession(data.session);
    }
  });
})();
