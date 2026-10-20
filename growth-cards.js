(() => {
  const series = [
    {
      key: "road-underfoot",
      title: "路在脚下",
      people: ["鲁迅", "老子", "陆游", "王阳明", "陶行知"],
    },
    {
      key: "living-water",
      title: "学问如活水",
      people: ["孔子", "荀子", "韩愈", "叶圣陶", "朱熹"],
    },
    {
      key: "aim-high",
      title: "志在高处",
      people: ["曹操", "王勃", "王之涣", "杜甫", "李贺"],
    },
    {
      key: "tempered-light",
      title: "磨砺成光",
      people: ["毛泽东", "孟子", "李白", "刘禹锡", "郑燮"],
    },
    {
      key: "world-at-heart",
      title: "心怀天下",
      people: ["范仲淹", "张载", "顾炎武", "林则徐", "梁启超"],
    },
    {
      key: "steadfast-character",
      title: "风骨自成",
      people: ["墨子", "白居易", "于谦", "张衡", "王冕"],
    },
    {
      key: "devotion",
      title: "赤诚与奉献",
      people: ["文天祥", "顾宪成", "巴金", "秋瑾", "戚继光"],
    },
    {
      key: "inner-light",
      title: "内心自有光",
      people: ["屈原", "诸葛亮", "龚自珍", "林徽因", "李清照"],
    },
  ];

  const cards = series.flatMap((group, seriesIndex) => group.people.map((name, pieceIndex) => ({
    slug: `five-${group.key}-${String(pieceIndex + 1).padStart(2, "0")}`,
    category: "five-piece",
    pool: "five-piece",
    name,
    title: group.title,
    seriesKey: group.key,
    seriesTitle: group.title,
    pieceIndex: pieceIndex + 1,
    pieceCount: group.people.length,
    imageUrl: `/media/growth-cards/${group.key}/${String(pieceIndex + 1).padStart(2, "0")}.png`,
    fullImageUrl: `/media/growth-cards/${group.key}/full.png`,
    sortOrder: seriesIndex * 10 + pieceIndex,
  })));

  window.ROBOSHEEP_GROWTH_SERIES = Object.freeze(series.map((group) => Object.freeze({ ...group })));
  window.ROBOSHEEP_GROWTH_CARDS = Object.freeze(cards.map((card) => Object.freeze(card)));
})();
