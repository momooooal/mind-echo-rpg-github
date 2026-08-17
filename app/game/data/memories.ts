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
  "first-rent-key": {
    id: "first-rent-key",
    ageFound: 21,
    titleAtTime: "第一把自己的鑰匙",
    descriptionAtTime: "門很薄、房租很貴，但關上之後沒有人會問你為什麼還醒著。",
    linkedEventIds: ["moving-out", "relationship", "aging"],
  },
  "deleted-love-message": {
    id: "deleted-love-message",
    ageFound: 28,
    titleAtTime: "刪掉的那一大段",
    descriptionAtTime: "你本來打算說最近很不好。對方最後只收到：哈哈沒事啦。",
    linkedEventIds: ["relationship", "masking-work", "memory-review"],
  },
  "company-lanyard": {
    id: "company-lanyard",
    ageFound: 32,
    titleAtTime: "工作證背面的刮痕",
    descriptionAtTime: "你在廁所練習普通表情時，指甲一直刮著同一個位置。",
    linkedEventIds: ["masking-work", "work-disclosure", "career-project"],
  },
  "adult-clinic-ticket": {
    id: "adult-clinic-ticket",
    ageFound: 34,
    titleAtTime: "下午還要上班的號碼牌",
    descriptionAtTime: "等了兩個多小時。真正說話的時間不到十分鐘。",
    linkedEventIds: ["adult-clinic", "aging"],
  },
  "missing-project": {
    id: "missing-project",
    ageFound: 35,
    titleAtTime: "行事曆上消失的專案",
    descriptionAtTime: "主管說是讓你休息。原本寫著你名字的格子換成別人。",
    linkedEventIds: ["work-disclosure", "career-project"],
  },
  "two-appointments": {
    id: "two-appointments",
    ageFound: 45,
    titleAtTime: "同一天的兩張掛號單",
    descriptionAtTime: "一張是家人的，一張是你的。兩個人都不是可以先消失的那一個。",
    linkedEventIds: ["caregiving", "aging"],
  },
  "copy-stack": {
    id: "copy-stack",
    ageFound: 49,
    titleAtTime: "影本的影本",
    descriptionAtTime: "窗口說少一份文件。你記得自己昨天就是來補這一份。",
    linkedEventIds: ["system-dungeon", "aging"],
  },
  "group-sticker": {
    id: "group-sticker",
    ageFound: 57,
    titleAtTime: "沒有解釋的貼圖",
    descriptionAtTime: "有人只傳了一隻趴著的鳥。你卻知道那大概是在說：我還在。",
    linkedEventIds: ["group-chat", "adult-ordinary-day", "last-day"],
  },
  "new-leaf": {
    id: "new-leaf",
    ageFound: 68,
    titleAtTime: "又長出來的一片葉子",
    descriptionAtTime: "這盆植物枯過兩次。第三次你沒有丟掉它。",
    linkedEventIds: ["aging", "last-day"],
  },
};

export function createMemory(id: string): MemoryFragment | undefined {
  const memory = MEMORY_CATALOG[id];
  return memory ? { ...memory, linkedEventIds: [...memory.linkedEventIds] } : undefined;
}
