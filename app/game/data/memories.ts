import type { MemoryFragment } from "../types";

export const MEMORY_CATALOG: Record<string, Omit<MemoryFragment, "interpretation" | "reinterpretAtAge">> = {
  "white-bag": {
    id: "white-bag",
    ageFound: 7,
    titleAtTime: "白色袋子",
    descriptionAtTime: "上面很多看不懂的字。大人說不能碰。",
    linkedEventIds: ["childhood-room", "first-clinic"],
  },
  "door-voices": {
    id: "door-voices",
    ageFound: 7,
    titleAtTime: "房門裡的聲音",
    descriptionAtTime: "大人突然小聲爭吵。門一開，他們說沒事。",
    linkedEventIds: ["childhood-room", "counselor-question"],
  },
  "red-date": {
    id: "red-date",
    ageFound: 7,
    titleAtTime: "已經過去的紅色日期",
    descriptionAtTime: "紙上的日期過了，紅色的字還留著。",
    linkedEventIds: ["childhood-room", "financial-pressure"],
  },
  "deleted-message": {
    id: "deleted-message",
    ageFound: 7,
    titleAtTime: "紅燈不閃了",
    descriptionAtTime: "答錄機本來有一則留言。後來大人把它刪掉了。",
    linkedEventIds: ["childhood-room", "help-seeking"],
  },
  "perfect-room": {
    id: "perfect-room",
    ageFound: 7,
    titleAtTime: "突然很整齊的客廳",
    descriptionAtTime: "半夜之後，每樣東西都忽然有了正確的位置。",
    linkedEventIds: ["childhood-room", "teen-surge"],
  },
  "school-signature": {
    id: "school-signature",
    ageFound: 7,
    titleAtTime: "空白的簽名欄",
    descriptionAtTime: "老師要大人簽名。你把那一頁闔起來。",
    linkedEventIds: ["childhood-room", "school-morning"],
  },
  "family-rule": {
    id: "family-rule",
    ageFound: 7,
    titleAtTime: "家裡的事留在家裡",
    descriptionAtTime: "你學會先判斷一件事能不能說，再判斷自己想不想說。",
    linkedEventIds: ["family-talk", "counselor-question", "partner-disclosure"],
  },
  "three-clicks": {
    id: "three-clicks",
    ageFound: 12,
    titleAtTime: "按了三次才坐起來",
    descriptionAtTime: "你明明知道公車要走了。身體像沒有收到同一則通知。",
    linkedEventIds: ["school-morning", "adult-workday"],
  },
  "left-behind": {
    id: "left-behind",
    ageFound: 12,
    titleAtTime: "玄關少了一樣東西",
    descriptionAtTime: "你到學校才知道忘了什麼。早上明明看過它。",
    linkedEventIds: ["school-morning", "self-blame"],
  },
  "first-interference": {
    id: "first-interference",
    ageFound: 16,
    titleAtTime: "那次真的不是普通累",
    descriptionAtTime: "你先替它找了很多普通理由。沒有一個能完整解釋。",
    linkedEventIds: ["teen-event", "first-clinic"],
  },
};

export function createMemory(id: string): MemoryFragment | undefined {
  const memory = MEMORY_CATALOG[id];
  return memory ? { ...memory, linkedEventIds: [...memory.linkedEventIds] } : undefined;
}
