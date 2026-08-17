import type { LifeEvent, TeenPattern } from "../types";

export const CHILDHOOD_OBJECTS = [
  { id: "fridge", label: "冰箱", icon: "冷", className: "object-fridge" },
  { id: "door", label: "房門", icon: "門", className: "object-door", memoryId: "door-voices" },
  { id: "phone", label: "答錄機", icon: "☎", className: "object-phone", memoryId: "deleted-message" },
  { id: "bin", label: "垃圾桶", icon: "桶", className: "object-bin" },
  { id: "notebook", label: "聯絡簿", icon: "簿", className: "object-notebook", memoryId: "school-signature" },
  { id: "bill", label: "帳單", icon: "單", className: "object-bill", memoryId: "red-date" },
  { id: "bag", label: "白色袋子", icon: "袋", className: "object-bag", memoryId: "white-bag" },
  { id: "sofa", label: "沙發", icon: "坐", className: "object-sofa", memoryId: "perfect-room" },
  { id: "shopping", label: "玄關袋子", icon: "袋", className: "object-shopping" },
] as const;

export const TEEN_EVENTS: Record<TeenPattern, LifeEvent> = {
  surge: {
    id: "teen-surge",
    ageRange: [15, 17],
    conditions: [{ trait: "moodVulnerability", min: 56 }],
    scene: "midnight-desk",
    dialogue: [{ speaker: "你", text: "十一點而已。今晚好像什麼都做得到。" }],
    hiddenEffects: { sleepDebt: 14, selfBlame: 4 },
    memoryUnlock: ["first-interference"],
    futureFlags: ["experiencedSurge"],
  },
  low: {
    id: "teen-low",
    ageRange: [15, 17],
    conditions: [{ trait: "moodVulnerability", min: 42 }],
    scene: "heavy-bedroom",
    dialogue: [{ speaker: "你", text: "只是一封信。為什麼手就是沒有動？" }],
    hiddenEffects: { sleepDebt: 8, selfBlame: 10 },
    memoryUnlock: ["first-interference"],
    futureFlags: ["experiencedLow"],
  },
  perception: {
    id: "teen-perception",
    ageRange: [16, 18],
    conditions: [{ trait: "perceptualSensitivity", min: 48 }],
    scene: "station-platform",
    dialogue: [{ speaker: "遠處的聲音", text: "……就是……他……" }],
    hiddenEffects: { sleepDebt: 5, selfBlame: 6 },
    memoryUnlock: ["first-interference"],
    futureFlags: ["realityCheckingCosts"],
  },
  alarm: {
    id: "teen-alarm",
    ageRange: [14, 17],
    conditions: [{ trait: "traumaLoad", min: 42 }],
    scene: "school-corridor",
    dialogue: [{ speaker: "同學", text: "只是門關比較大聲。你怎麼了？" }],
    hiddenEffects: { masking: 7, selfBlame: 5 },
    memoryUnlock: ["first-interference"],
    futureFlags: ["bodyKeepsWatch"],
  },
};

export const FUTURE_CHAPTERS = [
  { age: "19–25", title: "離家、第一份工作與第一次真正求助", systems: ["租屋", "關係", "求助"] },
  { age: "26–35", title: "工作、治療取捨、揭露與假裝沒事", systems: ["回診副本", "Masking", "戀愛"] },
  { age: "36–50", title: "職涯、照顧責任與反覆", systems: ["公司", "家人", "制度"] },
  { age: "51–65", title: "病友群、垃圾話與其他身分", systems: ["群組", "友情", "普通日"] },
  { age: "65+", title: "老化、醫療、關係與回望", systems: ["記憶重讀", "支持", "人生統計"] },
] as const;

export const CLINIC_TIMELINE = [
  { time: "07:10", label: "起床", note: "鬧鐘響了三次。" },
  { time: "08:03", label: "公車", note: "站了二十五分鐘。" },
  { time: "08:47", label: "捷運", note: "轉乘時忘了自己要往哪邊。" },
  { time: "09:18", label: "掛號", note: "拿到第 071 號。" },
  { time: "10:46", label: "候診", note: "號碼停在 064。" },
  { time: "11:37", label: "看診", note: "診間裡只過了九分鐘。" },
  { time: "11:52", label: "領藥／資料", note: "你問了會不會太想睡。藥師請你記下影響，下次和醫師討論。" },
  { time: "12:35", label: "離開醫院", note: "下午第一堂課已經開始。" },
] as const;
