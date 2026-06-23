(function () {
  /*
   * Theme-specific wall inscriptions for gallery pages.
   * Replace text/source here to update every exhibit without editing HTML.
   * Keep sources to philosopher/thinker names only, matching the exhibition style.
   */
  const library = {
    test: [
      { text: "认识你自己。", source: "苏格拉底" },
      { text: "未经审视的生活是不值得过的。", source: "苏格拉底" },
      { text: "人不是别的，正是他把自己造成的东西。", source: "让-保罗·萨特" },
      { text: "性格就是命运。", source: "赫拉克利特" },
      { text: "成为你自己。", source: "尼采" },
      { text: "人是悬挂在自己编织的意义之网上的动物。", source: "克利福德·格尔茨" },
      { text: "我思故我在。", source: "笛卡尔" },
      { text: "人是一切事物的尺度。", source: "普罗泰戈拉" }
    ],
    corridor: [
      { text: "密涅瓦的猫头鹰只在黄昏起飞。", source: "黑格尔" },
      { text: "世界历史不是幸福的园地。", source: "黑格尔" },
      { text: "历史总是当代史。", source: "克罗齐" },
      { text: "能被理解的存在就是语言。", source: "伽达默尔" },
      { text: "理解从来不是一种主观行为，而是置身于传统发生之中。", source: "伽达默尔" },
      { text: "科学革命是那些非累积的发展插曲。", source: "托马斯·库恩" },
      { text: "正常科学是解谜活动。", source: "托马斯·库恩" },
      { text: "科学知识像语言一样，本质上是群体的共同财产。", source: "托马斯·库恩" }
    ],
    scale: [
      { text: "自然不作飞跃。", source: "莱布尼茨" },
      { text: "自然界没有跳跃。", source: "莱布尼茨" },
      { text: "两种东西使我心中充满常新而日增的敬畏：我头上的星空和我心中的道德律。", source: "康德" },
      { text: "无限空间的永恒沉默使我恐惧。", source: "帕斯卡尔" },
      { text: "人只是一根芦苇，是自然界最脆弱的东西；但他是一根会思想的芦苇。", source: "帕斯卡尔" },
      { text: "整体先于部分。", source: "亚里士多德" },
      { text: "存在以多种方式被言说。", source: "亚里士多德" },
      { text: "单子没有窗户。", source: "莱布尼茨" },
      { text: "空间不是从外部经验得来的经验概念。", source: "康德" }
    ],
    quantum: [
      { text: "世界是事实的总和，而不是事物的总和。", source: "维特根斯坦" },
      { text: "凡是可说的，都可以说清楚；凡是不可说的，必须保持沉默。", source: "维特根斯坦" },
      { text: "我的语言的界限意味着我的世界的界限。", source: "维特根斯坦" },
      { text: "观察渗透着理论。", source: "诺伍德·汉森" },
      { text: "知识始于问题。", source: "卡尔·波普尔" },
      { text: "我们只能从错误中学习。", source: "卡尔·波普尔" },
      { text: "可反驳性是科学理论的标志。", source: "卡尔·波普尔" },
      { text: "我们所能认识的，不是物自身，而是物向我们显现的方式。", source: "康德" },
      { text: "知性不从自然取得法则，而是把法则规定给自然。", source: "康德" }
    ],
    imaging: [
      { text: "身体是我们拥有一个世界的总方式。", source: "梅洛-庞蒂" },
      { text: "我不是在身体之外拥有一个身体；我就是我的身体。", source: "梅洛-庞蒂" },
      { text: "可见之物总是包裹着不可见之物。", source: "梅洛-庞蒂" },
      { text: "知识与权力直接相互包含。", source: "福柯" },
      { text: "可见性是一种陷阱。", source: "福柯" },
      { text: "技术不是单纯的工具；技术是一种揭示方式。", source: "海德格尔" },
      { text: "真理的本质是无蔽。", source: "海德格尔" },
      { text: "灵魂从不离开表象而思维。", source: "亚里士多德" }
    ],
    light: [
      { text: "教育不是把视觉放进灵魂，而是使灵魂转向光。", source: "柏拉图" },
      { text: "善的理念给予被认识的事物以真理，给予认识者以能力。", source: "柏拉图" },
      { text: "太阳不仅使可见事物可见，也给予它们生成、生长和营养。", source: "柏拉图" },
      { text: "颜色是光的行动和受难。", source: "歌德" },
      { text: "若眼睛不是太阳般的，它怎能看见太阳？", source: "歌德" },
      { text: "可见之物总是包裹着不可见之物。", source: "梅洛-庞蒂" },
      { text: "真理的本质是无蔽。", source: "海德格尔" },
      { text: "灵魂从不离开表象而思维。", source: "亚里士多德" }
    ],
    time: [
      { text: "时间是运动依照先后而得的数。", source: "亚里士多德" },
      { text: "如果没有人问我时间是什么，我知道；如果要我解释，我便不知道。", source: "奥古斯丁" },
      { text: "时间不是经验得来的概念。", source: "康德" },
      { text: "时间是一切直观的形式条件。", source: "康德" },
      { text: "真正的时间是绵延。", source: "柏格森" },
      { text: "绵延意味着发明，意味着形式的创造。", source: "柏格森" },
      { text: "同一条河流，我们既踏入又不踏入。", source: "赫拉克利特" },
      { text: "万物流变。", source: "赫拉克利特" }
    ]
  };

  function rotate(el) {
    if (el.dataset.inscriptionReady === "true") return;
    el.dataset.inscriptionReady = "true";

    const topic = el.dataset.inscriptionTopic || "quantum";
    const items = library[topic] || library.quantum;
    const quote = el.querySelector(".quote, [data-inscription-text]");
    const source = el.querySelector(".source, [data-inscription-source]");
    if (!quote || !source || !items.length) return;

    let index = Number(el.dataset.inscriptionIndex || 0);
    const set = () => {
      quote.classList.add("fade");
      source.classList.add("fade");
      window.setTimeout(() => {
        const item = items[index % items.length];
        quote.textContent = item.text;
        source.textContent = item.source;
        quote.classList.remove("fade");
        source.classList.remove("fade");
        index += 1;
        el.dataset.inscriptionIndex = String(index);
      }, 340);
    };

    set();
    window.setInterval(set, Number(el.dataset.inscriptionInterval || 7600));
  }

  function rotateAll() {
    document.querySelectorAll("[data-inscription-topic]").forEach(rotate);
  }

  window.PhilosophyInscriptions = { library, rotateAll };
  document.addEventListener("DOMContentLoaded", rotateAll);
})();
