"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type StageId = "childhood" | "morning" | "teen" | "work" | "home33" | "group" | "oldage" | "summary";
type Point = { x: number; y: number };
type Memory = { id: string; age: number; title: string; text: string; reinterpretation?: string };
type Message = { id: string; from: string; text: string; time: string; read?: boolean; tone?: "normal" | "urgent" | "funny" };
type Choice = { label: string; effect?: () => void; close?: boolean };
type Modal = { speaker?: string; title?: string; text: string; choices?: Choice[] } | null;
type Hotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
  icon: string;
  className?: string;
  minutes?: number;
  once?: boolean;
  when?: (g: GameState) => boolean;
  action: (g: GameState) => InteractionResult;
};
type InteractionResult = {
  text?: string;
  thought?: string;
  modal?: Omit<NonNullable<Modal>, "choices"> & { choices?: { label: string; key: string }[] };
  addMemory?: Memory;
  reinterpretMemory?: { id: string; text: string };
  addItem?: string;
  removeItem?: string;
  flag?: string;
  counter?: keyof Counters;
  counterBy?: number;
  nextStage?: StageId;
  minutes?: number;
  messages?: Message[];
};
type Counters = {
  missedBus: number;
  forgotThings: number;
  pretendedOkay: number;
  saidNotOkay: number;
  deletedMessages: number;
  clinicTrips: number;
  ordinaryMeals: number;
  lateNightJokes: number;
  plants: number;
  deadlines: number;
  thingsMissed: number;
};
type HiddenState = {
  sleepDebt: number;
  attentionLoad: number;
  moodFlux: number;
  vigilance: number;
  selfBlame: number;
  masking: number;
  support: number;
};
type GameState = {
  stage: StageId;
  age: number;
  minute: number;
  day: number;
  pos: Point;
  flags: Record<string, boolean>;
  interacted: string[];
  memories: Memory[];
  inventory: string[];
  messages: Message[];
  hidden: HiddenState;
  counters: Counters;
  seed: number;
};

type StageSpec = {
  age: number;
  dayLabel: string;
  title: string;
  subtitle: string;
  start: number;
  end: number;
  spawn: Point;
  room: string;
  goal: string;
  exitLabel: string;
  ambience: string;
  hotspots: Hotspot[];
};

const SAVE_KEY = "mind-echo-rpg-playable-v4";
const TILE_W = 100 / 12;
const TILE_H = 100 / 8;
const clamp = (n: number, a = 0, b = 100) => Math.max(a, Math.min(b, n));
const fmt = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
const seeded = (seed: number, salt: number) => {
  let t = (seed ^ salt) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function freshGame(): GameState {
  const seed = typeof crypto !== "undefined" ? crypto.getRandomValues(new Uint32Array(1))[0] : Date.now();
  return {
    stage: "childhood",
    age: 7,
    seed,
    minute: 133,
    day: 1,
    pos: { x: 9, y: 6 },
    flags: {},
    interacted: [],
    memories: [],
    inventory: [],
    messages: [],
    hidden: {
      sleepDebt: 28 + Math.round(seeded(seed, 1) * 28),
      attentionLoad: 35 + Math.round(seeded(seed, 2) * 35),
      moodFlux: 25 + Math.round(seeded(seed, 3) * 45),
      vigilance: 25 + Math.round(seeded(seed, 4) * 45),
      selfBlame: 25 + Math.round(seeded(seed, 5) * 30),
      masking: 18 + Math.round(seeded(seed, 6) * 28),
      support: 25 + Math.round(seeded(seed, 7) * 35),
    },
    counters: { missedBus: 0, forgotThings: 0, pretendedOkay: 0, saidNotOkay: 0, deletedMessages: 0, clinicTrips: 0, ordinaryMeals: 0, lateNightJokes: 0, plants: 0, deadlines: 0, thingsMissed: 0 },
  };
}

const childhoodHotspots: Hotspot[] = [
  { id: "lamp", label: "客廳燈", x: 6, y: 1, icon: "💡", minutes: 1, action: () => ({ thought: "凌晨兩點。燈還亮著。平常這個時間大人會叫你趕快睡。" }) },
  { id: "whitebag", label: "白色袋子", x: 7, y: 4, icon: "▱", minutes: 2, once: true, action: () => ({ thought: "白色袋子被壓在雜誌下面。上面寫著『○○身心○○』，其他字太小了。", addMemory: { id: "whitebag", age: 7, title: "不能碰的白色袋子", text: "媽媽有一個白色袋子。你不知道裡面是什麼。" } }) },
  { id: "receipts", label: "收據", x: 4, y: 4, icon: "▤", minutes: 2, once: true, action: () => ({ text: "三張收據。都是今天。金額比你想像中多很多。", addMemory: { id: "receipts", age: 7, title: "同一天的三張收據", text: "玄關突然多了很多東西。爸爸看到收據時沒有說話。" } }) },
  { id: "sofa", label: "沙發", x: 3, y: 5, icon: "▰", minutes: 3, once: true, action: () => ({ text: "媽媽側躺著，沒有真的睡著。你靠近時，她說：『你怎麼起來了？快去睡。』", flag: "sawMomAwake" }) },
  { id: "calendar", label: "月曆", x: 1, y: 2, icon: "▦", minutes: 2, once: true, action: () => ({ thought: "下週三被紅筆圈起來。旁邊只有一個你看不懂的『回』。", addMemory: { id: "redcircle", age: 7, title: "月曆上的紅圈", text: "每隔幾個星期，月曆就會出現一個紅圈。" } }) },
  { id: "answer", label: "答錄機", x: 10, y: 2, icon: "☎", minutes: 3, once: true, action: () => ({ modal: { speaker: "答錄機", text: "『您好，提醒您明天下午——』\n\n喀。訊息被刪掉了。", choices: [{ label: "再按一次", key: "replay" }, { label: "算了", key: "close" }] }, addMemory: { id: "answer", age: 7, title: "被刪掉的留言", text: "你只聽到『提醒您明天下午』，後面就沒有了。" } }) },
  { id: "door", label: "爸媽房門", x: 10, y: 5, icon: "▥", minutes: 2, once: true, action: () => ({ text: "門沒有關緊。裡面傳來很小聲的爭論。你只聽到一句：『她明天還要上班。』", addMemory: { id: "voices", age: 7, title: "門後的小聲爭論", text: "大人以為你睡著了。" } }) },
  { id: "bedroom", label: "回房間", x: 11, y: 7, icon: "↘", minutes: 1, action: (g) => ({ nextStage: "morning", text: g.interacted.length < 3 ? "你沒有把客廳看完。很多事情本來就會這樣錯過。" : "你回房間。沒有答案，只有幾個記得住的畫面。" }) },
];

const morningHotspots: Hotspot[] = [
  { id: "bed", label: "起床", x: 2, y: 5, icon: "床", minutes: 4, action: (g) => g.flags.gotUp ? ({ thought: "你已經起來了。只是床還是很有吸引力。" }) : ({ text: g.hidden.sleepDebt > 45 ? "你坐起來，又倒回去。再按一次不是網頁壞掉。" : "腳終於碰到地板。", flag: g.flags.triedBed || g.hidden.sleepDebt <= 45 ? "gotUp" : "triedBed", minutes: g.flags.triedBed ? 3 : 5 }) },
  { id: "bathroom", label: "洗臉刷牙", x: 10, y: 1, icon: "水", minutes: 7, action: (g) => !g.flags.gotUp ? ({ thought: "你得先真的離開床。", minutes: 0 }) : ({ text: "牙刷含在嘴裡時，手機震了一下。你突然想不起來剛才進浴室還要拿什麼。", flag: "washed", counter: "forgotThings", messages: [{ id: "teacher-form", from: "班導", time: "07:18", text: "昨天那張回條今天要交喔。", tone: "normal" }] }) },
  { id: "bag", label: "書包", x: 5, y: 6, icon: "包", minutes: 5, action: () => ({ text: "國文、數學、聯絡簿……回條呢？", addItem: "書包", flag: "packed" }) },
  { id: "desk", label: "書桌", x: 5, y: 2, icon: "桌", minutes: 5, action: (g) => g.flags.formFound ? ({ thought: "桌上只剩橡皮擦屑。" }) : ({ text: "你在昨天的考卷下面找到回條。上面還沒有簽名。", addItem: "回條", flag: "formFound" }) },
  { id: "keys", label: "玄關盤", x: 9, y: 6, icon: "匙", minutes: 3, action: () => ({ text: "鑰匙在零錢下面。你差點又以為不見了。", addItem: "鑰匙", flag: "keys" }) },
  { id: "fridge", label: "冰箱", x: 9, y: 3, icon: "冷", minutes: 6, action: () => ({ text: "抓了一個昨天的飯糰。至少不是空腹。", addItem: "飯糰", counter: "ordinaryMeals" }) },
  { id: "phone", label: "手機", x: 3, y: 2, icon: "▣", minutes: 8, action: () => ({ text: "你只是想看通知。八分鐘後，你正在看一支『貓第一次看到黃瓜』的影片。", flag: "doomscroll", counter: "forgotThings", messages: [{ id: "class-meme", from: "班群 · 27", time: "07:26", text: "誰把老師P成薩諾斯啦哈哈哈哈", tone: "funny" }] }) },
  { id: "exit", label: "出門", x: 11, y: 7, icon: "門", minutes: 1, action: (g) => {
    const late = g.minute > 465;
    const noKeys = !g.inventory.includes("鑰匙");
    if (noKeys) return { modal: { speaker: "你", text: "手放到門把上。\n\n……鑰匙呢？", choices: [{ label: "回去找", key: "close" }, { label: "先衝出去再說", key: "leaveNoKeys" }] }, minutes: 0 };
    return { nextStage: "teen", flag: late ? "missedBus" : "caughtBus", counter: late ? "missedBus" : undefined, text: late ? "你跑到站牌時只看到公車屁股。今天從第一節遲到開始。" : "你趕上了。坐下後才發現飯糰還在口袋裡。" };
  } },
];

const teenHotspots: Hotspot[] = [
  { id: "friend", label: "同學小任", x: 3, y: 4, icon: "人", minutes: 5, action: () => ({ modal: { speaker: "小任", text: "『你最近是不是都沒睡？昨天凌晨三點還在群組回超長。』", choices: [{ label: "哪有，我精神超好", key: "teenMask" }, { label: "我也不知道，最近怪怪的", key: "teenOpen" }, { label: "哈哈你管我", key: "teenJoke" }] } }) },
  { id: "teacher", label: "班導", x: 8, y: 2, icon: "師", minutes: 6, action: () => ({ modal: { speaker: "班導", text: "『你最近一下很有精神，一下又整節趴著。要不要去輔導室坐一下？不一定要聊什麼。』", choices: [{ label: "好，我去坐一下", key: "goCounselor" }, { label: "不用，我只是沒睡飽", key: "skipCounselor" }] } }) },
  { id: "counselor", label: "輔導室", x: 10, y: 5, icon: "談", minutes: 18, when: (g) => g.flags.counselorAvailable, action: () => ({ modal: { speaker: "輔導老師", text: "『我不急著替你叫它什麼。先跟我說，最近最麻煩的是哪一件事？』", choices: [{ label: "睡不著又停不下來", key: "saySleep" }, { label: "有時候連很小的事都做不到", key: "sayHeavy" }, { label: "我不知道怎麼講", key: "sayDontKnow" }] } }) },
  { id: "clinicbag", label: "桌邊白袋", x: 11, y: 5, icon: "▱", minutes: 1, when: (g) => g.flags.counselorAvailable, action: (g) => g.memories.some((m) => m.id === "whitebag") ? ({ thought: "同樣的白色袋子。你盯了兩秒。七歲客廳的燈突然一起回來。", reinterpretMemory: { id: "whitebag", text: "17 歲：你第一次意識到，那可能是身心科的藥袋。但你仍不知道媽媽當時發生了什麼。" } }) : ({ thought: "一個很普通的白色袋子。你沒有特別多想。" }) },
  { id: "station", label: "離開學校", x: 11, y: 7, icon: "→", minutes: 12, action: (g) => ({ nextStage: "work", text: g.flags.askForHelp ? "你後來真的去了一次門診。不是因為終於『承認有病』，只是因為生活已經很麻煩。" : "那年你沒有去看醫生。生活還是繼續。求助不是每次都會在第一次機會發生。", counter: g.flags.askForHelp ? "clinicTrips" : "thingsMissed" }) },
];

const workHotspots: Hotspot[] = [
  { id: "desk", label: "你的座位", x: 4, y: 4, icon: "桌", minutes: 20, action: (g) => {
    const n = Number(g.flags.workTicks ? 2 : g.flags.workStarted ? 1 : 0);
    if (n === 0) return { text: "你打開檔案。標題已經看了四遍。聊天室跳出兩個紅點。", flag: "workStarted", messages: [{ id: "coworker-file", from: "同事阿嘉", time: fmt(g.minute), text: "那個表最後版在哪？主管等等要。", tone: "urgent" }] };
    if (n === 1) return { text: "你終於進入狀態。二十分鐘像五分鐘。做到一半，行事曆跳出『10:00 身心科』。", flag: "workTicks" };
    return { text: "專案真的做完了。不是勵志故事，你只是很會做這份工作。", flag: "projectDone", counter: "deadlines" };
  } },
  { id: "manager", label: "主管", x: 8, y: 2, icon: "主", minutes: 8, action: (g) => !g.flags.projectDone ? ({ modal: { speaker: "主管", text: "『你今天看起來有點累，下午簡報可以嗎？』", choices: [{ label: "可以啊，沒事", key: "workMask" }, { label: "我今天有回診，簡報我會做完，但可能晚十分鐘", key: "workBoundary" }, { label: "我想先出去一下", key: "workExit" }] } }) : ({ text: "主管翻完簡報：『這版比上週清楚很多。』你沒有因為生病突然失去工作能力。" }) },
  { id: "clinic", label: "電梯／回診", x: 11, y: 3, icon: "梯", minutes: 95, action: (g) => g.minute > 660 ? ({ text: "門診時段已經過了。你把提醒往下滑掉。", flag: "missedClinic", counter: "thingsMissed" }) : ({ modal: { speaker: "行事曆", title: "10:00 身心科", text: "走出去，這個上午大概就沒了。專案不會替你停。", choices: [{ label: "去回診", key: "goClinicAdult" }, { label: "今天先不去", key: "skipClinicAdult" }] }, minutes: 0 }) },
  { id: "pantry", label: "茶水間", x: 2, y: 2, icon: "杯", minutes: 8, action: () => ({ text: "同事正在研究哪台咖啡機最難用。你們花八分鐘罵它。這八分鐘沒有任何治療意義，但很好笑。", counter: "lateNightJokes" }) },
  { id: "toilet", label: "廁所", x: 2, y: 6, icon: "休", minutes: 10, action: () => ({ thought: "你坐在蓋起來的馬桶上，什麼都沒做。十分鐘後才回去。", flag: "hidInToilet" }) },
  { id: "leave", label: "下班", x: 11, y: 7, icon: "→", minutes: 1, action: (g) => ({ nextStage: "home33", text: g.flags.projectDone ? "你下班了。專案交出去，回診去沒去、跟主管說多少，都是另外一件事。" : "你還是下班了。今天有事情沒做完。世界沒有跳出 Game Over。", counter: g.flags.projectDone ? undefined : "thingsMissed" }) },
];

const home33Hotspots: Hotspot[] = [
  { id: "phone", label: "手機", x: 8, y: 5, icon: "▣", minutes: 6, action: () => ({ modal: { speaker: "阿沐", text: "『你今天是不是不太想講話？如果不想見我可以直接說。』\n\n你盯著輸入框。", choices: [{ label: "打：不是你，我今天真的很累", key: "partnerOpen" }, { label: "打很長一段，全部刪掉，改成：哈哈沒事啦", key: "partnerDelete" }, { label: "先不回", key: "partnerSilent" }] } }) },
  { id: "laundry", label: "洗衣籃", x: 3, y: 5, icon: "衣", minutes: 14, action: () => ({ text: "洗衣機轉起來。你居然記得把口袋裡的衛生紙拿出來。今天的小勝利。", flag: "laundry" }) },
  { id: "food", label: "晚餐", x: 9, y: 2, icon: "飯", minutes: 18, action: () => ({ text: "便利商店的飯不是人生轉捩點。只是熱的，而且你有吃。", counter: "ordinaryMeals", flag: "ateDinner" }) },
  { id: "shower", label: "洗澡", x: 2, y: 2, icon: "水", minutes: 15, action: (g) => g.hidden.sleepDebt > 55 && !g.flags.showerTried ? ({ thought: "你知道只要走進去、開水、洗完就好。你在浴室門口站了一會。", flag: "showerTried", minutes: 5 }) : ({ text: "洗完了。沒有升級動畫。只是比較舒服一點。", flag: "showered" }) },
  { id: "bed", label: "睡覺", x: 5, y: 2, icon: "床", minutes: 1, action: (g) => ({ nextStage: "group", text: g.flags.ateDinner ? "你把手機插上充電，忘了回其中一個人。明天再說。" : "你躺下才想起來沒吃晚餐。今天就是這樣結束。", counter: g.flags.ateDinner ? undefined : "thingsMissed" }) },
];

const groupHotspots: Hotspot[] = [
  { id: "plant", label: "植物", x: 3, y: 3, icon: "葉", minutes: 4, action: () => ({ text: "這盆植物居然活了三年。你不是很確定是誰比較厲害。", counter: "plants", flag: "wateredPlant" }) },
  { id: "food", label: "宵夜", x: 8, y: 2, icon: "麵", minutes: 12, action: () => ({ text: "泡麵加蛋。群組有人開始爭論蛋要半熟還是全熟。", counter: "ordinaryMeals", messages: [{ id: "egg-war", from: "魚", time: "23:18", text: "全熟蛋到底誰在吃？？？", tone: "funny" }, { id: "egg-reply", from: "33", time: "23:18", text: "我。你完了。", tone: "funny" }] }) },
  { id: "phone", label: "病友群", x: 6, y: 5, icon: "聊", minutes: 10, action: () => ({ modal: { speaker: "群組 · 今天也活著", text: "23:12 魚：主管又問我為什麼一直請假\n23:13 N：（貼圖）\n23:14 米糕：我今天睡16小時==\n23:14 阿鳥：好爽\n23:15 米糕：爽個屁我事情全部沒做\n23:17 33：有人吃晚餐ㄌ嗎\n23:19 小葉：今天有點不太好", choices: [{ label: "回：我在，你不用現在解釋", key: "groupHere" }, { label: "丟一張抱抱貼圖", key: "groupSticker" }, { label: "看到了，但今天沒有力氣回", key: "groupSilent" }, { label: "先回：我泡麵蛋煮爆了==", key: "groupJoke" }] } }) },
  { id: "tv", label: "電視", x: 10, y: 4, icon: "▣", minutes: 10, action: () => ({ text: "新聞又把『精神疾病』四個字放得很大。你把音量轉小。群組同時有人傳：『又要被連坐了是不是。』", flag: "stigmaNews" }) },
  { id: "bed", label: "去睡", x: 2, y: 6, icon: "床", minutes: 1, action: () => ({ nextStage: "oldage", text: "你在群組丟一句『我要睡了真的』。五分鐘後又回了一個貼圖。", counter: "lateNightJokes" }) },
];

const oldageHotspots: Hotspot[] = [
  { id: "plant", label: "老植物", x: 3, y: 3, icon: "葉", minutes: 6, action: () => ({ text: "它還在。你也還在。兩個都比當年想像中久。", counter: "plants" }) },
  { id: "album", label: "舊盒子", x: 8, y: 3, icon: "盒", minutes: 12, action: (g) => g.memories.length ? ({ modal: { speaker: "記憶", text: g.memories.slice(0, 3).map((m) => `・${m.title}${m.reinterpretation ? `\n  ${m.reinterpretation}` : ""}`).join("\n\n"), choices: [{ label: "收好", key: "close" }] } }) : ({ text: "盒子裡沒有你以為會記得的東西。很多線索就是沒被留下來。" }) },
  { id: "phone", label: "舊手機", x: 6, y: 5, icon: "▣", minutes: 8, action: () => ({ text: "群組有人又改了第三次暱稱。你看不出來是誰，只好問：『你哪位』。", counter: "lateNightJokes" }) },
  { id: "food", label: "下午點心", x: 9, y: 6, icon: "餅", minutes: 15, action: () => ({ text: "今天的豆花很好吃。病歷不會記這件事。", counter: "ordinaryMeals" }) },
  { id: "chair", label: "窗邊椅子", x: 5, y: 2, icon: "椅", minutes: 1, action: () => ({ nextStage: "summary", text: "你坐了一會。沒有旁白替這一生下診斷。" }) },
];

const STAGES: Record<Exclude<StageId, "summary">, StageSpec> = {
  childhood: { age: 7, dayLabel: "凌晨的一小段", title: "客廳還亮著", subtitle: "沒有人告訴你要找什麼。想回房間隨時都可以。", start: 133, end: 170, spawn: { x: 9, y: 6 }, room: "childhood", goal: "想知道就靠近看看；也可以直接回房。", exitLabel: "回房間", ambience: "冰箱低鳴、時鐘很大聲。", hotspots: childhoodHotspots },
  morning: { age: 12, dayLabel: "星期二", title: "07:10，上學前", subtitle: "07:45 的公車不會等你。", start: 430, end: 475, spawn: { x: 2, y: 5 }, room: "morning", goal: "想辦法出門。你不一定每件事都做得到。", exitLabel: "出門", ambience: "鬧鐘、洗衣機、通知聲同時存在。", hotspots: morningHotspots },
  teen: { age: 17, dayLabel: "放學後", title: "今天沒有哪一格叫『發病』", subtitle: "你只覺得最近有些事情變得很麻煩。", start: 990, end: 1110, spawn: { x: 2, y: 6 }, room: "school", goal: "回家以前，去哪裡、跟誰說話都由你決定。", exitLabel: "離開學校", ambience: "掃地聲、球場、走廊上的鞋底聲。", hotspots: teenHotspots },
  work: { age: 24, dayLabel: "星期四", title: "工作、回診，還有今天", subtitle: "你會做這份工作。問題是一天只有這麼長。", start: 525, end: 1080, spawn: { x: 4, y: 6 }, room: "office", goal: "下午有簡報，10:00 有門診。你自己安排。", exitLabel: "下班", ambience: "鍵盤聲、咖啡機、每隔幾分鐘亮一次的通知。", hotspots: workHotspots },
  home33: { age: 33, dayLabel: "普通晚上", title: "回家之後也還有生活", subtitle: "洗澡、吃飯、回訊息。沒有一項值得上新聞。", start: 1185, end: 1470, spawn: { x: 6, y: 6 }, room: "adult-home", goal: "想做什麼就做。累了就去睡。", exitLabel: "睡覺", ambience: "洗衣機、樓上拖椅子、手機亮一下。", hotspots: home33Hotspots },
  group: { age: 57, dayLabel: "23:08", title: "群組今晚也很吵", subtitle: "沒有人負責當完美病友。", start: 1388, end: 1510, spawn: { x: 5, y: 6 }, room: "group-home", goal: "吃東西、看群組、澆花，或直接睡。", exitLabel: "睡覺", ambience: "貼圖、泡麵、有人突然說自己不太好。", hotspots: groupHotspots },
  oldage: { age: 82, dayLabel: "午後", title: "今天也不是結局關卡", subtitle: "只是一個走得比較慢的普通下午。", start: 900, end: 1140, spawn: { x: 7, y: 6 }, room: "old-home", goal: "看看房間裡還剩下什麼。", exitLabel: "坐一下", ambience: "窗外有車，水壺剛跳起來。", hotspots: oldageHotspots },
};

const STAGE_ORDER: StageId[] = ["childhood", "morning", "teen", "work", "home33", "group", "oldage", "summary"];

function stageStart(id: StageId) {
  if (id === "summary") return { age: 82, minute: 1080, pos: { x: 5, y: 5 } };
  const s = STAGES[id];
  return { age: s.age, minute: s.start, pos: s.spawn };
}

function sceneProps(room: string) {
  if (room === "childhood") return [
    ["window", 1, 1, 3, 2, "窗"], ["sofaProp", 2, 4, 3, 2, "沙發"], ["tableProp", 5, 4, 3, 2, "矮桌"], ["cabinet", 9, 1, 2, 2, "櫃"], ["rug", 5, 6, 4, 1, "地毯"],
  ] as const;
  if (room === "morning") return [["bedProp", 1, 4, 3, 2, "床"], ["deskProp", 4, 1, 3, 2, "書桌"], ["kitchen", 8, 1, 3, 3, "廚房"], ["entry", 8, 5, 3, 2, "玄關"]] as const;
  if (room === "school") return [["classroom", 1, 1, 4, 3, "教室"], ["hall", 5, 1, 2, 6, "走廊"], ["office", 8, 1, 3, 2, "導師室"], ["counseling", 8, 4, 3, 2, "輔導室"]] as const;
  if (room === "office") return [["desks", 2, 3, 5, 3, "座位區"], ["managerRoom", 7, 1, 3, 2, "主管"], ["pantryProp", 1, 1, 2, 2, "茶水間"], ["lift", 10, 1, 1, 3, "電梯"], ["toiletProp", 1, 5, 2, 2, "廁所"]] as const;
  return [["bedProp", 1, 1, 3, 2, "床"], ["tableProp", 7, 1, 3, 2, "桌"], ["sofaProp", 4, 4, 4, 2, "沙發"], ["window", 9, 4, 2, 2, "窗"]] as const;
}

function initialMessageFor(stage: StageId, minute: number): Message[] {
  if (stage === "morning") return [{ id: "alarm", from: "鬧鐘", time: fmt(minute), text: "起床。真的。", tone: "urgent" }];
  if (stage === "work") return [{ id: "calendar", from: "行事曆", time: "08:45", text: "10:00 身心科｜下午簡報", tone: "normal" }];
  if (stage === "home33") return [{ id: "amu", from: "阿沐", time: "19:41", text: "你今天還好嗎？", tone: "normal" }];
  if (stage === "group") return [{ id: "group-ping", from: "今天也活著 · 48", time: "23:08", text: "33：有人吃晚餐ㄌ嗎", tone: "funny" }];
  return [];
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [game, setGame] = useState<GameState>(() => freshGame());
  const [modal, setModal] = useState<Modal>(null);
  const [log, setLog] = useState("你可以用方向鍵 / WASD 移動，靠近物件後按 E 或直接點物件。");
  const [thought, setThought] = useState("");
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [hasSave, setHasSave] = useState(false);
  const moveCooldown = useRef(false);

  useEffect(() => { setHasSave(Boolean(localStorage.getItem(SAVE_KEY))); }, []);
  useEffect(() => {
    if (!started) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    setHasSave(true);
  }, [game, started]);

  const stage = game.stage === "summary" ? null : STAGES[game.stage];
  const visibleHotspots = useMemo(() => stage?.hotspots.filter((h) => !h.when || h.when(game)) ?? [], [stage, game]);
  const nearby = useMemo(() => visibleHotspots.find((h) => Math.abs(h.x - game.pos.x) + Math.abs(h.y - game.pos.y) <= 1.6), [visibleHotspots, game.pos]);

  const updateHiddenForTime = useCallback((prev: GameState, minutes: number): HiddenState => {
    const late = prev.minute + minutes > 1320 || prev.minute < 360;
    return {
      ...prev.hidden,
      sleepDebt: clamp(prev.hidden.sleepDebt + (late ? Math.ceil(minutes / 18) : 0)),
      attentionLoad: clamp(prev.hidden.attentionLoad + (prev.messages.filter((m) => !m.read).length > 3 ? 1 : 0)),
    };
  }, []);

  const addToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };

  const advanceTo = useCallback((nextStage: StageId, base: GameState) => {
    const next = stageStart(nextStage);
    const nextMessages = initialMessageFor(nextStage, next.minute);
    return {
      ...base,
      stage: nextStage,
      age: next.age,
      minute: next.minute,
      pos: next.pos,
      day: base.day + 1,
      interacted: [],
      messages: [...base.messages, ...nextMessages],
      flags: { ...base.flags, [`entered-${nextStage}`]: true },
    };
  }, []);

  const applyResult = useCallback((hotspot: Hotspot, result: InteractionResult) => {
    setGame((prev) => {
      let next: GameState = { ...prev };
      const minutes = result.minutes ?? hotspot.minutes ?? 3;
      next.minute += minutes;
      next.hidden = updateHiddenForTime(prev, minutes);
      if (hotspot.once && !next.interacted.includes(hotspot.id)) next.interacted = [...next.interacted, hotspot.id];
      if (result.flag) next.flags = { ...next.flags, [result.flag]: true };
      if (result.addItem && !next.inventory.includes(result.addItem)) next.inventory = [...next.inventory, result.addItem];
      if (result.removeItem) next.inventory = next.inventory.filter((i) => i !== result.removeItem);
      if (result.addMemory && !next.memories.some((m) => m.id === result.addMemory?.id)) {
        next.memories = [...next.memories, result.addMemory];
        addToast("記住了一件事");
      }
      if (result.reinterpretMemory) next.memories = next.memories.map((m) => m.id === result.reinterpretMemory?.id ? { ...m, reinterpretation: result.reinterpretMemory.text } : m);
      if (result.counter) next.counters = { ...next.counters, [result.counter]: next.counters[result.counter] + (result.counterBy ?? 1) };
      if (result.messages?.length) next.messages = [...next.messages, ...result.messages];
      if (result.nextStage) next = advanceTo(result.nextStage, next);
      return next;
    });
    if (result.text) setLog(result.text);
    if (result.thought) setThought(result.thought);
    if (result.modal) setModal({ ...result.modal, choices: result.modal.choices?.map((c) => ({ label: c.label, close: true, effect: () => handleChoice(c.key) })) });
  }, [advanceTo, updateHiddenForTime]);

  const interact = useCallback((hotspot: Hotspot) => {
    if (modal || phoneOpen || memoryOpen || pauseOpen) return;
    const result = hotspot.action(game);
    applyResult(hotspot, result);
  }, [applyResult, game, memoryOpen, modal, pauseOpen, phoneOpen]);

  const move = useCallback((dx: number, dy: number) => {
    if (!started || game.stage === "summary" || modal || phoneOpen || memoryOpen || pauseOpen || moveCooldown.current) return;
    moveCooldown.current = true;
    window.setTimeout(() => { moveCooldown.current = false; }, 35);
    setGame((prev) => ({ ...prev, pos: { x: clamp(prev.pos.x + dx, 0.5, 11.5), y: clamp(prev.pos.y + dy, 0.5, 7.5) } }));
    setThought("");
  }, [game.stage, memoryOpen, modal, pauseOpen, phoneOpen, started]);

  const handleChoice = useCallback((key: string) => {
    setModal(null);
    setGame((prev) => {
      let next = { ...prev };
      const inc = (field: keyof HiddenState, by: number) => { next.hidden = { ...next.hidden, [field]: clamp(next.hidden[field] + by) }; };
      const counter = (field: keyof Counters, by = 1) => { next.counters = { ...next.counters, [field]: next.counters[field] + by }; };
      switch (key) {
        case "replay": setLog("你再按一次。答錄機只說：『沒有新留言。』"); break;
        case "leaveNoKeys": counter("forgotThings"); next.flags = { ...next.flags, leftWithoutKeys: true }; next = advanceTo("teen", next); setLog("門鎖上的瞬間你才想起來：鑰匙在家裡。今天晚上再處理。"); break;
        case "teenMask": inc("masking", 5); counter("pretendedOkay"); setLog("『哪有，我精神超好。』小任看了你一下，沒有再問。"); break;
        case "teenOpen": inc("support", 5); counter("saidNotOkay"); setLog("小任沒有分析你，只說：『喔。那今天放學我陪你走去車站。』"); break;
        case "teenJoke": counter("lateNightJokes"); setLog("你把問題講成笑話。小任也笑了。兩件事可以同時是真的。"); break;
        case "goCounselor": next.flags = { ...next.flags, counselorAvailable: true }; setLog("輔導室的門沒有鎖。你可以去，也可以最後還是直接回家。"); break;
        case "skipCounselor": counter("thingsMissed"); setLog("『不用啦，我只是沒睡飽。』這一次機會就這樣過去了。沒有警報響起來。"); break;
        case "saySleep": next.flags = { ...next.flags, askForHelp: true }; inc("support", 7); counter("saidNotOkay"); setLog("老師問你願不願意讓她幫忙找一個可以再聊的人。你說：『可以吧。』"); break;
        case "sayHeavy": next.flags = { ...next.flags, askForHelp: true }; inc("selfBlame", -4); counter("saidNotOkay"); setLog("你第一次把『我知道很簡單，但就是做不到』完整說完。"); break;
        case "sayDontKnow": inc("support", 2); setLog("老師說：『不知道也可以。那我們先坐到下課。』"); break;
        case "workMask": inc("masking", 6); counter("pretendedOkay"); setLog("『可以啊，沒事。』你聽見自己用一個很熟的語氣說。"); break;
        case "workBoundary": inc("support", 3); counter("saidNotOkay"); next.flags = { ...next.flags, partialDisclosure: true }; setLog("主管只回：『好，那你回來再跟我說。』沒有大型感人橋段。"); break;
        case "workExit": setLog("你去廁所待了十分鐘。主管沒有追進來。"); break;
        case "goClinicAdult": next.minute += 95; next.flags = { ...next.flags, adultClinic: true }; counter("clinicTrips"); inc("sleepDebt", 4); setLog("09:51 離開公司。10:24 掛號。11:36 看診。11:47 領藥。回公司時午餐時間快結束了。醫生看了大約九分鐘。"); break;
        case "skipClinicAdult": next.flags = { ...next.flags, missedClinic: true }; counter("thingsMissed"); setLog("你把提醒往後滑。不是因為你不知道要去，是今天真的擠不下。"); break;
        case "partnerOpen": inc("support", 7); counter("saidNotOkay"); setLog("你傳：『不是你，我今天真的很累。』對方過了一會只回：『好，那我買吃的過去，不講話也可以。』"); break;
        case "partnerDelete": inc("masking", 5); counter("deletedMessages"); counter("pretendedOkay"); setLog("輸入框從六行變成：『哈哈沒事啦』。對方看到的是最後那五個字。"); break;
        case "partnerSilent": counter("thingsMissed"); setLog("你把手機扣在桌上。訊息還在那裡，沒有變成道德考題。"); break;
        case "groupHere": inc("support", 4); counter("saidNotOkay", 0); setLog("你回：『我在，你不用現在解釋。』五分鐘沒人說話，然後有人貼了一張很醜的狗。"); break;
        case "groupSticker": counter("lateNightJokes"); setLog("你丟了一張抱抱貼圖。小葉按了愛心。下一則是米糕：『幹我藥掉到床底』。"); break;
        case "groupSilent": setLog("你看到了，但今天沒有力氣回。群組沒有因此把你判定為壞朋友。"); break;
        case "groupJoke": counter("lateNightJokes"); setLog("你：『我泡麵蛋煮爆了==』\n阿鳥：『先救蛋』\n小葉：『笑死』\n事情沒有被解決，但房間沒那麼安靜了。"); break;
        default: break;
      }
      return next;
    });
  }, [advanceTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D", "e", "E", "Enter"].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") move(0, -1);
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") move(0, 1);
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") move(-1, 0);
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") move(1, 0);
      if ((e.key.toLowerCase() === "e" || e.key === "Enter") && nearby) interact(nearby);
      if (e.key === "Escape") { setModal(null); setPhoneOpen(false); setMemoryOpen(false); setPauseOpen(false); }
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [interact, move, nearby]);

  useEffect(() => {
    if (!started || !stage) return;
    if (game.minute > stage.end && !game.flags[`late-${game.stage}`]) {
      setGame((prev) => ({ ...prev, flags: { ...prev.flags, [`late-${prev.stage}`]: true }, counters: { ...prev.counters, thingsMissed: prev.counters.thingsMissed + 1 } }));
      setLog("時間已經超過你原本預計的點。遊戲不會把一天重置給你。");
    }
  }, [game.minute, game.stage, stage, started]);

  function startNew() {
    const g = freshGame();
    setGame(g);
    setStarted(true);
    setLog("凌晨 02:13。你被客廳的聲音吵醒。沒有人叫你去調查；你也可以直接回房間。");
    setThought("");
  }

  function resume() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return startNew();
      setGame(JSON.parse(raw) as GameState);
      setStarted(true);
      setLog("回到你上次停下來的地方。");
    } catch { startNew(); }
  }

  if (!started) {
    return <main className="landing-v4">
      <header className="top-brand"><span>回</span><b>一生的回聲</b><small>PLAYABLE LIFE RPG · v4</small></header>
      <section className="hero-v4">
        <div className="hero-copy-v4">
          <p className="eyebrow">不是讀故事。先活一天。</p>
          <h1>有些事情，<br /><em>別人不用這麼用力。</em></h1>
          <p className="lead">你可以亂逛、錯過、忘記、敷衍、求助、假裝沒事、準時，也可以遲到。沒有疾病選單，也沒有「正確劇情」。</p>
          <div className="hero-actions"><button className="primary" onClick={startNew}>出生</button>{hasSave && <button onClick={resume}>繼續上次的人生</button>}</div>
          <p className="tiny">鍵盤：WASD / 方向鍵移動，E 互動。手機也有方向鍵。進度只存在你的瀏覽器。</p>
        </div>
        <div className="hero-world" aria-hidden="true">
          <div className="demo-room"><i className="demo-window"/><i className="demo-sofa"/><i className="demo-table"/><i className="demo-bag">▱</i><i className="demo-person"/></div>
          <div className="hero-caption"><b>02:13</b><span>客廳還亮著。</span></div>
          <div className="hero-caption second"><b>07:42</b><span>公車不會等你。</span></div>
          <div className="hero-caption third"><b>10:24</b><span>看九分鐘醫生，上午快沒了。</span></div>
        </div>
      </section>
      <section className="principles-v4"><article><b>可以錯過</b><p>線索、人物、求助機會都可能真的錯過。第二輪不保證一樣。</p></article><article><b>時間會走</b><p>點手機、找東西、候診、發呆都會吃掉同一個早上。</p></article><article><b>世界不等你</b><p>玩家知道要做什麼，不代表角色每次都能立刻做到。</p></article><article><b>病不是主角</b><p>你還是要吃飯、上班、談戀愛、罵咖啡機和在群組講垃圾話。</p></article></section>
    </main>;
  }

  if (game.stage === "summary") {
    const foundBag = game.memories.find((m) => m.id === "whitebag");
    return <main className="summary-v4">
      <header><span>82 歲之後</span><h1>病歷沒有記完你。</h1><p>這些不是評分。只是這一輪留下來的東西。</p></header>
      <section className="summary-grid">
        <article><b>{game.counters.forgotThings}</b><span>次走到一半忘記本來要幹嘛</span></article>
        <article><b>{game.counters.missedBus}</b><span>次真的沒趕上</span></article>
        <article><b>{game.counters.pretendedOkay}</b><span>次說「沒事」</span></article>
        <article><b>{game.counters.saidNotOkay}</b><span>次真的說出不太好</span></article>
        <article><b>{game.counters.clinicTrips}</b><span>次這一輪看得到的回診</span></article>
        <article><b>{game.counters.ordinaryMeals}</b><span>頓很普通但有吃到的東西</span></article>
        <article><b>{game.counters.lateNightJokes}</b><span>次其實沒必要但很好笑</span></article>
        <article><b>{game.counters.thingsMissed}</b><span>件錯過後也沒有 Game Over 的事</span></article>
      </section>
      <section className="ending-note"><p>{foundBag ? (foundBag.reinterpretation ? "你七歲看到的白色袋子，十年後才有了一個可能的解釋。" : "你記得那個白色袋子，但直到最後也沒有把它完全解開。") : "這一輪，你根本沒有注意到七歲客廳裡的白色袋子。那個答案因此從來沒有成為你的謎題。"}</p><p>有些人會比你早求助，有些人晚很多；有些人工作得很好但回診一直卡住；有些人最記得的是半夜群組裡一個很醜的貼圖。</p><strong>你不是扮演一個精神疾病患者。你只是把這個人的一些普通日子活完了。</strong></section>
      <div className="summary-actions"><button className="primary" onClick={startNew}>再出生一次</button><button onClick={() => { setStarted(false); }}>回首頁</button></div>
    </main>;
  }

  if (!stage) return null;

  const props = sceneProps(stage.room);
  const progressIndex = STAGE_ORDER.indexOf(game.stage);
  const unread = game.messages.filter((m) => !m.read).length;

  return <main className={`game-v4 room-${stage.room}`}>
    <header className="hud-v4">
      <button className="brand-button" onClick={() => setPauseOpen(true)}>回</button>
      <div className="hud-age"><small>{stage.dayLabel}</small><b>{game.age} 歲</b></div>
      <div className="hud-clock"><small>現在</small><b>{fmt(game.minute)}</b></div>
      <div className="hud-life" aria-label="人生進度">{STAGE_ORDER.slice(0, -1).map((s, i) => <i key={s} className={i < progressIndex ? "past" : i === progressIndex ? "now" : "future"}/>)}</div>
      <button className="hud-btn" onClick={() => setPhoneOpen(true)}>手機{unread > 0 && <span>{unread}</span>}</button>
      <button className="hud-btn" onClick={() => setMemoryOpen(true)}>記憶 <span>{game.memories.length}</span></button>
      <button className="hud-btn" onClick={() => setPauseOpen(true)}>暫停</button>
    </header>

    <section className="stage-heading-v4"><div><span>{stage.ambience}</span><h1>{stage.title}</h1><p>{stage.subtitle}</p></div><aside><b>今天</b><p>{stage.goal}</p><small>{game.minute > stage.end ? "原本預計的時間已經過了。" : `約到 ${fmt(stage.end)} 前。`}</small></aside></section>

    <section className="world-wrap">
      <div className="world-v4" role="application" aria-label={`${game.age} 歲的可探索場景`}>
        <div className="grid-lines" aria-hidden="true" />
        {props.map(([id, x, y, w, h, label]) => <div key={id} className={`scene-prop ${id}`} style={{ left: `${x * TILE_W}%`, top: `${y * TILE_H}%`, width: `${w * TILE_W}%`, height: `${h * TILE_H}%` }}><span>{label}</span></div>)}
        {visibleHotspots.map((h) => {
          const near = Math.abs(h.x - game.pos.x) + Math.abs(h.y - game.pos.y) <= 1.6;
          const done = h.once && game.interacted.includes(h.id);
          return <button key={h.id} className={`hotspot ${near ? "near" : ""} ${done ? "done" : ""} ${h.className ?? ""}`} style={{ left: `${h.x * TILE_W}%`, top: `${h.y * TILE_H}%` }} onClick={() => near ? interact(h) : (setGame((prev) => ({ ...prev, pos: { x: h.x, y: h.y } })), setLog(`你走向「${h.label}」。再點一次或按 E 互動。`))} aria-label={h.label}><i>{h.icon}</i><b>{h.label}</b></button>;
        })}
        <div className="player-v4" style={{ left: `${game.pos.x * TILE_W}%`, top: `${game.pos.y * TILE_H}%` }} aria-label="你"><i/><span>你</span></div>
        {nearby && <div className="interact-pill">E　{nearby.label}</div>}
      </div>

      <aside className="side-panel-v4">
        <section className="now-card"><span>此刻</span><p>{thought || log}</p></section>
        <section className="pocket-card"><span>身上</span>{game.inventory.length ? <div>{game.inventory.map((i) => <b key={i}>{i}</b>)}</div> : <p>沒特別帶什麼。</p>}</section>
        <section className="not-score"><span>不是數值</span><p>{game.hidden.sleepDebt > 58 ? "身體很重。" : game.hidden.sleepDebt > 42 ? "有點沒睡飽。" : "今天還撐得住。"}</p><p>{game.hidden.attentionLoad > 62 ? "腦袋同時開很多東西。" : "腦袋暫時還在這裡。"}</p><p>{game.hidden.masking > 48 ? "已經很習慣說『沒事』。" : "有些話還說得出口。"}</p></section>
      </aside>
    </section>

    <section className="mobile-controls" aria-label="移動控制"><button onClick={() => move(0, -1)}>↑</button><button onClick={() => move(-1, 0)}>←</button><button className="interact-mobile" disabled={!nearby} onClick={() => nearby && interact(nearby)}>E</button><button onClick={() => move(1, 0)}>→</button><button onClick={() => move(0, 1)}>↓</button></section>

    {toast && <div className="toast-v4">{toast}</div>}

    {modal && <div className="overlay-v4" onClick={() => !modal.choices && setModal(null)}><section className="dialog-v4" onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}>{modal.speaker && <span>{modal.speaker}</span>}{modal.title && <h2>{modal.title}</h2>}<p>{modal.text}</p>{modal.choices && <div className="choice-stack">{modal.choices.map((c) => <button key={c.label} onClick={() => { c.effect?.(); if (c.close !== false) setModal(null); }}>{c.label}</button>)}</div>}<button className="close-dialog" onClick={() => setModal(null)}>關閉</button></section></div>}

    {phoneOpen && <div className="overlay-v4"><section className="phone-v4"><header><div><small>{fmt(game.minute)}</small><b>手機</b></div><button onClick={() => setPhoneOpen(false)}>收起</button></header><div className="phone-feed">{game.messages.length ? [...game.messages].reverse().map((m) => <article key={m.id} className={m.tone ?? "normal"}><span>{m.from}<i>{m.time}</i></span><p>{m.text}</p></article>) : <p className="empty-phone">現在沒有新訊息。這也很正常。</p>}</div><button className="phone-bottom" onClick={() => { setGame((prev) => ({ ...prev, messages: prev.messages.map((m) => ({ ...m, read: true })) })); }}>全部標成已讀</button></section></div>}

    {memoryOpen && <div className="overlay-v4"><section className="memory-v4"><header><div><small>你真的有看到的東西</small><b>記憶盒</b></div><button onClick={() => setMemoryOpen(false)}>關閉</button></header>{game.memories.length ? <div className="memory-list">{game.memories.map((m) => <article key={m.id}><span>{m.age} 歲</span><h3>{m.title}</h3><p>{m.text}</p>{m.reinterpretation && <blockquote>{m.reinterpretation}</blockquote>}</article>)}</div> : <p className="empty-memory-v4">目前沒有特別留下來的線索。不是每個房間都需要搜乾淨。</p>}</section></div>}

    {pauseOpen && <div className="overlay-v4"><section className="pause-v4"><span>PAUSED</span><h2>先停在這裡。</h2><p>這個版本故意允許錯過事件、遲到、沒有回答、直接睡覺。不是每個按鈕都需要按。</p><div className="pause-actions-v4"><button className="primary" onClick={() => setPauseOpen(false)}>繼續</button><button onClick={() => { setPauseOpen(false); setStarted(false); }}>回首頁</button><button onClick={startNew}>重新出生</button></div><small>內容涉及精神困擾、家庭壓力與求助經驗；未呈現具體自傷方法或把危機作為遊戲勝負。</small></section></div>}
  </main>;
}
