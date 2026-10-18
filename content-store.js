(() => {
  const legacyWeeklies = [
    {
      id: "weekly-2026-10-10",
      kind: "weekly",
      slug: "2026-10-10",
      title: "本周是美好且令我超级开心的一周",
      happened_at: "2026-10-10T12:00:00+08:00",
      status: "published",
      body: "",
      images: [],
      sections: [
        {
          heading: "启俊的生日",
          paragraphs: [
            "我从小到大都是一个不过生日的人，不管是自己的还是别人的。生日对于我来说，只不过是又大了一岁，仅此而已，但是很开心的是这周启俊能邀请我到他家做客。",
            "于我而言，家其实是一个较为隐私的地方。一个人如果能邀请你去他家，那他真的真的非常地信任你、喜欢你。所以非常谢谢启俊哥能邀请我到他家里做客！这让我充分觉得我的工作是有意义的，我们之间相处起来是不错的。",
            "谢谢你让我更加坚定地认为加入团队是正确的选择。谢谢你让我感受到这个团队超级不错的氛围。",
          ],
          images: [],
        },
        {
          heading: "王博的到来",
          paragraphs: [
            "虽然我不善言辞，没有在王博的欢迎会上提出自己感兴趣的问题，但是我能从大家的提问及王博的回答上，听见自己想要的答案。这次欢迎会上真的收获了很多很多知识，如：热与噪音的仿真，美的晋升的困难等等。",
            "四合一会上，虽然我不懂结构，但是我能感受到王博作为一名老工程师的严谨与稳重。真的能够给予我们很多很多样机上的建议。差点爱上！",
          ],
          images: [],
        },
      ],
    },
    {
      id: "weekly-2026-09-19",
      kind: "weekly",
      slug: "2026-09-19",
      title: "本周是充实且有趣的一周",
      happened_at: "2026-09-19T12:00:00+08:00",
      status: "published",
      body: "",
      images: [],
      sections: [
        {
          heading: "考试",
          paragraphs: ["回学校考试是一件非常痛苦的事情。因为要把时间花在没用的地方，且自己得不到任何的成长。但是至少见到了队内的小登，算是难过下的一丝宽慰吧！不过考试也算是过了，还是挺开心的！"],
          images: [],
        },
        {
          heading: "和雨哥聊天",
          paragraphs: ["雨哥是一个特别温暖的人。因为每次去公司，碰巧遇到雨哥，雨哥都会关心我的日常和心理状态，就像电影里那些大哥哥一样温暖。我焦虑的每一个问题雨哥都能够找到一个robomaster的例子开导我。为我指明方向，让我要坚定自己的判断，不能别人说什么就是什么；而判断力是需要刻意练习的，你可以过后再想，但是不能让他过去。"],
          images: [],
        },
        {
          heading: "和斌哥聊天",
          paragraphs: ["斌哥是一个非常细心的人。他能在我的言语中发现“我对我们之间关系的不自信”（注意这里有回旋镖）。他懂得如何引导别人深入思考的人。他会举不同人制定OKR的标准让我自己思考我该成为什么样的人、后续我该如何管理好MCU、让我反思我目前现阶段还缺的能力与品质、让我注意自身的行为举止。超级地谢谢斌哥。"],
          images: [],
        },
        {
          heading: "和曾经的伙伴聊天（回旋镖）",
          paragraphs: ["本周五，我和曾经在队内关系还不错的好朋友聊天，大概是问“最近在干什么”之类的问题，但他的言语中全是带有“请教、麻烦、打扰、迷茫”。我在想到底是什么样一所公司能让我的好朋友变成这个样子⊙﹏⊙ ，越发觉得咱公司就是世界上最好的公司，哈哈哈哈哈。"],
          images: [],
        },
        {
          heading: "聊天后的改变",
          paragraphs: [
            "我会像雨哥说的那样进行一些刻意练习了。我会去查关于会上的知识。比如说“为什么要使用蜗轮蜗杆”。",
            "我会像斌哥所说的一样做一些提高自信的事情，比如说“把宿舍、洗手间、客厅、厨房卫生弄好一丢丢，每天把被子叠好，每天早睡早起”，来提高自己的自信心和成就感。",
            "我会去制定更难的O",
            "我会尽可能用问题+事例+callback的形式与人沟通。",
            "我会尽可能处理好自己的状态，少去叹气，少去表达负面情绪。",
            "我相信我能成为一个更好的我。",
          ],
          images: [],
        },
        {
          heading: "美食探索",
          paragraphs: ["本周感谢海林给我们推荐了一家超级好吃的店^ω^！真的超级好吃！也感谢梓斌陪我一起探索美食！就在科广！希望我们以后能去各种各样的地方探索好吃的好玩的。"],
          images: [],
        },
        {
          heading: "一些遗憾",
          paragraphs: ["本来周六想参加小登的机甲宣讲会的，可惜他们因为场地原因延期了，不过周末能陪陪家里人也蛮开心的。"],
          images: [],
        },
        {
          heading: "一些开心",
          paragraphs: ["本周终于像上次周报说的那样子装到桌子啦！超级开心✧٩(ˊωˋ*)و✧，许愿成功。和爸妈、外公外婆一起吃饭聊天，分享在公司里的经历，他们都超级支持我一直待在公司，超级开心٩(๑^o^๑)۶"],
          images: [],
        },
      ],
    },
  ];

  const config = window.ROBOSHEEP_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const client = configured && window.supabase
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;

  const dateLabel = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date).replaceAll("/", ".");
  };

  const summaryFromSections = (sections = []) =>
    sections
      .slice(0, 3)
      .map((section) => section.heading)
      .filter(Boolean)
      .join("，") + (sections.length ? "。" : "");

  const normalize = (post) => ({
    ...post,
    images: Array.isArray(post.images) ? post.images : [],
    sections: Array.isArray(post.sections) ? post.sections : [],
  });

  const fallback = (kind) => kind === "weekly" ? legacyWeeklies.map(normalize) : [];

  async function listPublished(kind) {
    if (!client) return fallback(kind);
    const { data, error } = await client
      .from("posts")
      .select("id,kind,slug,title,body,sections,images,happened_at,published_at,status")
      .eq("kind", kind)
      .eq("status", "published")
      .order("happened_at", { ascending: false });
    if (error) {
      console.warn("Unable to load published content, using local fallback.", error.message);
      return fallback(kind);
    }
    return (data || []).map(normalize);
  }

  async function getPublished(kind, identity) {
    const posts = await listPublished(kind);
    return posts.find((post) => post.id === identity || post.slug === identity) || null;
  }

  async function listComments(targetKind, targetKey) {
    if (!client) throw new Error("评论服务尚未配置");
    const { data, error } = await client
      .from("public_comments")
      .select("id,target_kind,target_key,nickname,body,parent_id,created_at,avatar_url,is_registered")
      .eq("target_kind", targetKind)
      .eq("target_key", targetKey)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function createComment(comment) {
    if (!client) throw new Error("评论服务尚未配置");
    const { error } = await client
      .from("comments")
      .insert(comment);
    if (error) throw error;
  }

  async function listOwnedCommentIds(visitorToken) {
    if (!client) throw new Error("评论服务尚未配置");
    const { data, error } = await client.rpc("owned_comment_ids", {
      requester_token: visitorToken,
    });
    if (error) throw error;
    return (data || []).map((row) => row.comment_id);
  }

  async function deleteOwnComment(commentId, visitorToken) {
    if (!client) throw new Error("评论服务尚未配置");
    const { error } = await client.rpc("delete_own_comment", {
      requested_comment_id: commentId,
      requester_token: visitorToken,
    });
    if (error) throw error;
  }

  async function getAuthState() {
    if (!client) return { session: null, user: null, profile: null };
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    const session = data.session;
    if (!session?.user) return { session: null, user: null, profile: null };
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("user_id,nickname,avatar_url,provider")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (profileError) console.warn("Unable to read public profile.", profileError.message);
    const fallbackProfile = {
      user_id: session.user.id,
      nickname: session.user.user_metadata?.nickname
        || session.user.user_metadata?.user_name
        || session.user.email?.split("@")[0]
        || "访客",
      avatar_url: session.user.user_metadata?.avatar_url || "",
      provider: session.user.app_metadata?.provider || "email",
    };
    return { session, user: session.user, profile: profile || fallbackProfile };
  }

  async function claimVisitorComments(visitorToken) {
    if (!client) throw new Error("评论服务尚未配置");
    const { data, error } = await client.rpc("claim_visitor_comments", {
      requester_token: visitorToken,
    });
    if (error) throw error;
    return data || 0;
  }

  async function hydrateHome() {
    const weeklyTargets = document.querySelectorAll("[data-latest-weekly-title]");
    const momentTargets = document.querySelectorAll("[data-latest-moment-text]");
    if (!weeklyTargets.length && !momentTargets.length) return;

    const [weeklies, moments] = await Promise.all([
      weeklyTargets.length ? listPublished("weekly") : Promise.resolve([]),
      momentTargets.length ? listPublished("moment") : Promise.resolve([]),
    ]);

    const weekly = weeklies[0];
    if (weekly) {
      document.querySelectorAll("[data-latest-weekly-title]").forEach((node) => {
        node.textContent = weekly.title;
      });
      document.querySelectorAll("[data-latest-weekly-date]").forEach((node) => {
        node.textContent = dateLabel(weekly.happened_at);
      });
      document.querySelectorAll("[data-latest-weekly-summary]").forEach((node) => {
        node.textContent = summaryFromSections(weekly.sections);
      });
    }

    const moment = moments[0];
    if (moment) {
      document.querySelectorAll("[data-latest-moment-text]").forEach((node) => {
        node.textContent = moment.body;
      });
      document.querySelectorAll("[data-latest-moment-date]").forEach((node) => {
        node.textContent = dateLabel(moment.happened_at);
      });
      document.querySelectorAll("[data-latest-moment-images]").forEach((node) => {
        node.replaceChildren(...moment.images.slice(0, 2).map((image) => {
          const img = document.createElement("img");
          img.src = typeof image === "string" ? image : image.url;
          img.alt = "";
          return img;
        }));
      });
    }
  }

  window.contentStore = Object.freeze({
    client,
    configured,
    config,
    dateLabel,
    summaryFromSections,
    legacyWeeklies,
    listPublished,
    getPublished,
    listComments,
    createComment,
    listOwnedCommentIds,
    deleteOwnComment,
    getAuthState,
    claimVisitorComments,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrateHome, { once: true });
  } else {
    hydrateHome();
  }
})();
