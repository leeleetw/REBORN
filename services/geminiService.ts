
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CAT_QUOTES = [
  "喵～餓是一陣子，帥是一輩子喵。",
  "放下雞排，立地成貓喵！",
  "你的腹肌只是在玩躲貓貓，快把他們找出來喵。",
  "深呼吸，那不是餓，是你的意志在燃燒喵。",
  "摸摸我，你就沒手拿宵夜了喵。",
  "你今天的汗水，是明天消腫的淚水喵。",
  "別看了，螢幕不會變好吃的喵。",
  "再撐一下，明早起來你會感謝現在的自己喵。",
  "意志力就像罐罐，要開就有喵！",
  "貓都能忍住不抓沙發，你一定能忍住不點外送喵。",
  "你這不是餓，是靈魂寂寞在討債喵。",
  "想想你穿上那件緊身衣的樣子，帥炸了喵！",
  "汗水是脂肪的眼淚，讓它流吧喵！",
  "你是要當一輩子的小胖橘，還是要當優雅的身影喵？",
  "剛才那一摸，我把我的耐力傳給你了喵。",
  "不要讓你的嘴巴，毀了你身體的修行喵。",
  "喝水吧，水是不用錢的靈丹妙藥喵。",
  "我就靜靜看著你，看你敢不敢打開冰箱喵。",
  "你這是在修行，不是在自虐，放輕鬆喵。",
  "優秀的人都在睡覺了，只有你想著吃喵。",
  "深夜的誘惑都是魔鬼的耳語，別聽喵！",
  "你是自己的主人，不是食慾的奴隸喵。",
  "今天的你比昨天更精實了一點點，我感覺到了喵。",
  "貓一輩子都在減肥（雖然看不出來），你並不孤單喵。",
  "把想吃的錢存起來給我買罐罐不好嗎喵？",
  "你的意志力比鑽石還硬，我相信你喵。",
  "忍住這一波，你就是神喵！",
  "脂肪正在哀嚎，這聲音真好聽喵。",
  "如果你現在吃了，明早你會想揍自己喵。",
  "深吸一口氣，感覺空氣中的自由，而不是香氣喵。",
  "你正在變成你喜歡的樣子，這過程很美喵。",
  "別被大腦騙了，你其實一點都不餓喵。",
  "我是靈氣貓，我說你會瘦你就會瘦喵！",
  "再堅持 5 分鐘，衝動就會退潮了喵。",
  "你是要美食的 5 分鐘，還是要自信的 24 小時喵？",
  "去洗個澡，把食慾沖掉喵。",
  "摸摸我的頭，把焦慮都給我吧喵。",
  "修行就是不斷跟昨天的自己說再見喵。",
  "你的帥氣正在覺醒中，別把它吵醒後又餵飽喵。",
  "你是戰士，戰士是不會在宵夜面前投降的喵。",
  "肚子叫是你在變強的背景音樂喵。",
  "除了貓，沒什麼是值得你半夜不睡覺的喵。",
  "把慾望轉化為動力，你現在能跑十公里喵！",
  "你不需要那塊炸雞，你需要的是一個擁抱喵。",
  "我就在這邊守護你的意志力防線喵。",
  "如果你累了，就睡吧，夢裡什麼都有喵。",
  "明天早上的體重計會給你最好的報答喵。",
  "這點誘惑都過不去，怎麼統治地球喵？",
  "你是要當一顆球，還是一個傳奇喵？",
  "修行人的快樂，吃貨是不會懂的喵。",
  "你的身體是一座神廟，別塞垃圾進去喵。",
  "我就喜歡看你堅持的樣子，很有魅力喵。",
  "食慾是幻覺，體態才是真實喵。",
  "每一口忍下的誘惑，都是一次等級提升喵。",
  "你是這場遊戲的主角，主角是不會輕易領便當的喵。",
  "世界很亂，但你的心要靜喵。",
  "摸一下 10 點 EXP，再摸一下 20 點喵！",
  "你比你想像中的還要強大喵。",
  "不要因為一時的嘴軟，造成一世的腰軟喵。",
  "你是要穿帥氣的西裝，還是寬鬆的大龍袍喵？",
  "貓爪之下，食慾退散喵！",
  "深吸一口氣，吐出所有的煩惱喵。",
  "修行路長，但每一步都算數喵。",
  "你今天完成的任務，我都有記在心裡喵。",
  "貓咪的祝福：願你明天身輕如燕喵！",
  "別讓幾口食物，決定你明天的心情喵。",
  "你是修行者，眼光要放遠喵。",
  "誘惑就像雷根糖，看起來美，吃多會膩喵。",
  "你的靈魂在發光，因為你正在自律喵。",
  "自律的感覺，比吃飽的感覺爽多了喵。",
  "你是要滿足肚子，還是要滿足鏡子喵？",
  "別心急，脂肪不是一天長出來的，也不會一天消失喵。",
  "穩定發揮，你就是贏家喵。",
  "我會一直陪著你，直到你達成目標喵。",
  "剛才那一摸，我感受到了你的堅定喵。",
  "這隻貓正在對你進行精神加持喵！",
  "修行不是為了給別人看，是為了讓自己爽喵。",
  "你的進步雖然微小，但累積起來就是奇蹟喵。",
  "放下手機，閉上眼，感受身體的輕盈喵。",
  "不要在深夜跟本能對抗，快去睡覺喵！",
  "明天早上的陽光，會照在一個更棒的你身上喵。",
  "你是萬中選一的修行奇才喵。",
  "這場遊戲，你註定會通關喵。",
  "貓咪不騙貓咪，你現在真的很帥/美喵。",
  "把想吃的慾望，變成摸我的次數吧喵。",
  "你正在重啟人生，這難道不興奮嗎喵？",
  "所有的辛苦，都會在穿上新衣服那天煙消雲散喵。",
  "你是意志力的化身，你是重啟的英雄喵。",
  "我就愛你這種不服輸的勁頭喵。",
  "深呼吸，感受靈氣在體內流動喵。",
  "你不是在節食，你是在選擇更好的生活喵。",
  "貓咪授權：今日份的努力已達標喵！",
  "別回頭看那些宵夜，往前看你的未來喵。",
  "你是光，你是熱，你是燃燒脂肪的火喵！",
  "修行是一場馬拉松，節奏要穩喵。",
  "摸摸我，感受這份平靜與力量喵。",
  "你值得擁有一個更健康的身體喵。",
  "不要對自己太苛刻，你已經做得很好了喵。",
  "你是這顆星球上最有毅力的橘貓（誤，是人類）喵。",
  "重啟人生，從這分鐘的忍耐開始喵！"
];

export const getPettingQuote = async (level: number): Promise<string> => {
  // 從資料庫中隨機挑選一句，實現即時回饋
  const randomIndex = Math.floor(Math.random() * CAT_QUOTES.length);
  return CAT_QUOTES[randomIndex];
};

export const getMotivationalQuote = async (level: number, type: 'attack' | 'backup' = 'attack'): Promise<string> => {
  try {
    const prompt = type === 'attack' 
      ? `You are a mystical spirit cat. The player is at level ${level}. Provide a sharp, powerful 1-sentence quote in Traditional Chinese to dispel food cravings. Tone: Fierce wisdom.`
      : `You are a mystical spirit cat. Provide a warm, deeply encouraging 1-sentence quote in Traditional Chinese to restore willpower. Mention their future peak version. Tone: Gentle support.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "想想明天的輕盈喵！";
  } catch (error) {
    return "意志力爆發！";
  }
};

export const getFinalBlessing = async (): Promise<string> => {
  try {
    const prompt = `The user has reached the ultimate Level 99. Write a profound, soul-stirring blessing in Traditional Chinese (about 120 words). 
    The tone should be a Zen Master Cat. Focus on 'The habit is now your nature', 'You are the light', and 'A new life begins'.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    return response.text?.trim() || "恭喜你，修行圓滿。你已不再是追逐目標的人，你本身就是目標。";
  } catch (error) {
    return "修行圓滿。你已重獲新生。";
  }
};

export const generateCatImage = async (level: number): Promise<string | null> => {
  let catDesc = "";
  if (level <= 10) catDesc = "an incredibly cute, round, and fluffy orange tabby cat with big curious eyes";
  else if (level <= 40) catDesc = "a cute and healthy orange tabby cat, looking fit and energetic, with a happy expression";
  else if (level <= 80) catDesc = "a sleek, cute, and athletic orange cat, wearing a small adventure backpack, with sparkling confident eyes";
  else catDesc = "a majestic yet still adorable spirit orange cat, with a subtle golden aura, looking wise and peaceful";

  const natureSpots = [
    "a cozy living room corner with a soft rug and warm sunlight",
    "a sun-drenched wooden window sill looking out at a garden",
    "a lush green backyard garden with blooming flowers and butterflies",
    "a peaceful local park with a small pond and willow trees",
    "a sun-dappled forest trail with tall ancient trees",
    "the breathtaking Swiss Alps with snow-capped mountains and green meadows",
    "the vast and colorful Grand Canyon at sunset",
    "a serene lakeside in New Zealand with crystal clear blue water",
    "a field of cherry blossoms with Mount Fuji in the background",
    "the magical Northern Lights (Aurora Borealis) in a starry Arctic night",
    "the infinite beauty of a starry nebula in the deep cosmos, looking back at Earth"
  ];

  const spotIndex = Math.min(Math.floor(level / 9), natureSpots.length - 1);
  const currentSpot = natureSpots[spotIndex];

  const prompt = `
    A stunning Pixar-style 3D character render of ${catDesc}. 
    Location: ${currentSpot}.
    Atmosphere: Breathtaking natural scenery, cinematic lighting, vibrant yet peaceful colors.
    Level: LV.${level}.
    Style: Detailed fur texture, expressive features, heartwarming and inspiring atmosphere, 8k resolution.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: { imageConfig: { aspectRatio: "1:1" } },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};
