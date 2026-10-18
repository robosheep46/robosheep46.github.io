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

  const legacyStories = [
    {
      id: "story-2023-robomaster",
      kind: "story",
      slug: "2023-robomaster",
      title: "RoboMaster",
      happened_at: "2023-09-01T12:00:00+08:00",
      status: "published",
      sort_order: 0,
      body: "从想证明自己，到第一次真正看见代码动起来。",
      images: [{ url: "../media/archive-cover.jpg?v=1", path: "" }],
      sections: [
        {
          key: "2023-09",
          month: "2023-09",
          heading: "我想证明，我不属于这里",
          paragraphs: [
            "2023 年 9 月，我来到一所二本院校。",
            "那时的我认定这所学校很差，也把来到这里视为一种失败。我觉得天塌了，甚至觉得这是一件无比耻辱的事。",
            "大一上学期，我开始拼命证明自己。我想拿到军训标兵，想拿专业第一，想进入机甲大师实验室。我希望在每一个可以比较的地方赢下来，证明自己足够强，也证明自己不应该属于这里。",
            "我想这样做，也确实做到了。那个学期，我拿到了军训标兵，拿到了全专业绩点第一，也成功加入了机甲大师实验室。按照当时的标准，这几乎是一个完美的结果。",
            "现在回头看，那时的我不配打RM，因为我并不是真正热爱比赛，只是简单的证明失败的不是我罢了。",
          ],
        },
        {
          key: "2024-01",
          month: "2024-01",
          heading: "我拿到了第一，却只会点灯",
          paragraphs: [
            "加入实验室以后，我很快发现，“第一”并没有给我带来答案。",
            "2024 年大一下学期，师兄开始给我安排各种工作：数据标注、训练模型、制作 PPT、整理 PPT 比赛要求的文档，还有视频剪辑。这些事情我都做了。我每天看起来很忙，也确实完成了不少任务。但如果问我在电控方面学会了什么，我很难给出一个像样的回答。",
            "我就这样忙忙碌碌地虚度光阴。甚至看到此处，你都无法猜到我到底属于哪个组别。那我现在告诉你：电控组。如果你问当时的我会什么，我只能很诚实地回答：调用一个函数，然后点亮一盏灯。",
            "当时还是打开教学视频，照着别人敲代码，编译、下载，只要灯亮了，就算成功。至于代码为什么要这样写，程序又是怎么运行起来的，我说不清楚。听起来有些荒唐，但当时确实如此。",
            "我曾经以为，加入实验室就意味着自己已经迈进了技术的大门。后来才发现，我只是拿到了站在门口的资格。",
          ],
        },
        {
          key: "2024-03",
          month: "2024-03",
          heading: "一场没赢的广东站",
          paragraphs: [
            "2024 年 3 月，我作为梯队队员，第一次来到 RoboMaster 广东站。",
            "那次比赛，我没有真正上场，主要站在一旁观察和学习。",
            "赛场上有各种各样的机器人。有些车的结构、动作和完成度，光是看着就让人觉得很酷。",
            "然后我再回头看自己的队伍。1V1 没赢，3V3 也没赢。一场胜利都没有。我第一次如此具体地看见，我们和别人之间究竟隔着多远。但真正让我感到无力的事情，还在比赛结束以后。",
          ],
        },
        {
          key: "2024-04",
          month: "2024-04",
          heading: "第一次看技术报告",
          paragraphs: [
            "比赛结束后，学长整理了大量文档和技术报告。里面记录着电控组在比赛中暴露出来的问题，也列出了许多需要继续整改的地方。学长希望后来的人能够接着做，把这些问题一个个解决掉。",
            "问题是，当时电控组里没有大二成员，只有大三，技术传承中间几乎断了一层。而我没有真正写过代码，也没有独立解决过什么技术问题。报告里的每一个问题都在等人处理，可我连报告里在写什么都看不懂。",
            "这就像有人把维修手册递给一个只会开灯的人，然后告诉他：接下来，你来修。",
          ],
        },
        {
          key: "2024-05",
          month: "2024-05",
          heading: "第一个任务",
          paragraphs: [
            "2024 年 5 月比赛结束后，刘可学长开始用任务的方式引导我。每个星期，他都会安排一个具体任务，让我自己查资料、理解，再想办法完成。",
            "我依稀记得，第一周的任务是整理以前的代码。我要把散落在代码各处的变量写进结构体，再把不同的结构体集中到同一个头文件里。当时学校C语言课程只考到函数，所以那时的我既不知道什么是结构体，也不知道什么是头文件。我只能先去 B 站搜索“结构体是什么”，弄明白最基本的概念，再回到原来的代码里，一点点理解刘可学长到底要我改什么。",
          ],
        },
        {
          key: "2024-06",
          month: "2024-06",
          heading: "第一次观察数据",
          paragraphs: [
            "第二周的任务，是采集遥控器的数据。我继续跟着 B 站的视频，了解遥控器协议，了解串口，再尝试把这些刚刚认识的概念放进真实代码里。我在 Keil5 中把遥控器的数据加入 Watch 窗口。拨动了一下遥控器的摇杆。keil5里的数据也跟着发生了变化。",
            "当时的我真的非常开心。因为我不再是只会点灯，而是能试着理解为什么这么做了，那是我第一次真切地感觉到，代码其实不是对着视频去照抄。",
            "我曾经以为，“第一”就是答案。但在 2024 年 5 月，比起成绩单上的专业第一，那个跟着摇杆一起变化的数字，似乎更接近我真正想找到的东西。",
          ],
        },
      ],
    },
  ];

  const legacyPhotos = [
    {
      id: "photo-2026-10-17-pork",
      kind: "photo",
      slug: "2026-10-17-pork",
      title: "斌哥给我夹的锅包肉",
      body: "斌哥给我夹的锅包肉",
      happened_at: "2026-10-17T12:00:00+08:00",
      status: "published",
      sort_order: 0,
      images: [{ url: "../media/2026-10-17-pork.jpg", path: "" }],
      sections: [],
    },
    {
      id: "photo-2026-10-17-stew",
      kind: "photo",
      slug: "2026-10-17-stew",
      title: "第二次和斌哥一起吃铁锅炖",
      body: "第二次和斌哥一起吃铁锅炖",
      happened_at: "2026-10-17T11:00:00+08:00",
      status: "published",
      sort_order: 1,
      images: [{ url: "../media/2026-10-17-stew.jpg", path: "" }],
      sections: [],
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
    sort_order: Number.isFinite(Number(post.sort_order)) ? Number(post.sort_order) : 0,
  });

  const fallback = (kind) => ({
    weekly: legacyWeeklies,
    story: legacyStories,
    photo: legacyPhotos,
  }[kind] || []).map(normalize);

  async function listPublished(kind) {
    if (!client) return fallback(kind);
    const fields = "id,kind,slug,title,body,sections,images,happened_at,published_at,status";
    let query = client
      .from("posts")
      .select(kind === "story" || kind === "photo" ? `${fields},sort_order` : fields)
      .eq("kind", kind)
      .eq("status", "published");
    query = kind === "story"
      ? query.order("sort_order", { ascending: true }).order("happened_at", { ascending: true })
      : query.order("happened_at", { ascending: false });
    const { data, error } = await query;
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
    if (targetKind === "story_node" && !data?.length) {
      const { data: legacyData, error: legacyError } = await client
        .from("public_comments")
        .select("id,target_kind,target_key,nickname,body,parent_id,created_at,avatar_url,is_registered")
        .eq("target_kind", "robomaster_node")
        .eq("target_key", targetKey)
        .order("created_at", { ascending: true });
      if (!legacyError && legacyData?.length) return legacyData;
    }
    return data || [];
  }

  async function createComment(comment) {
    if (!client) throw new Error("评论服务尚未配置");
    const { error } = await client
      .from("comments")
      .insert(comment);
    if (error?.code === "23514" && comment.target_kind === "story_node") {
      const { error: legacyError } = await client
        .from("comments")
        .insert({ ...comment, target_kind: "robomaster_node" });
      if (legacyError) throw legacyError;
      return;
    }
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
    legacyStories,
    legacyPhotos,
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
