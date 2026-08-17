import { createMemory } from "../data/memories";
import type { GameAction, GameState, HiddenEffect, HiddenTraits, LifeCounters, MemoryFragment } from "../types";
import { createLife } from "./createGame";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function applyEffects(traits: HiddenTraits, effects?: HiddenEffect): HiddenTraits {
  if (!effects) return traits;
  const next = { ...traits };
  for (const [key, value] of Object.entries(effects)) {
    const trait = key as keyof HiddenTraits;
    next[trait] = clamp(next[trait] + (value ?? 0));
  }
  return next;
}

function addCounters(counters: LifeCounters, additions?: Partial<LifeCounters>): LifeCounters {
  if (!additions) return counters;
  const next = { ...counters };
  for (const [key, value] of Object.entries(additions)) {
    const counter = key as keyof LifeCounters;
    next[counter] += value ?? 0;
  }
  return next;
}

function addMemory(memories: MemoryFragment[], memoryId?: string): MemoryFragment[] {
  if (!memoryId || memories.some((memory) => memory.id === memoryId)) return memories;
  const memory = createMemory(memoryId);
  return memory ? [...memories, memory] : memories;
}

function signalsForPhase(state: GameState, phase: GameState["phase"]) {
  if (phase === "childhood-room" || phase === "family-talk") {
    return { sleep: "被客廳的聲音吵醒", mind: "有幾件事對不上", body: "肚子有點緊", people: "先看大人的臉色", next: "明天要交聯絡簿", unread: 0 };
  }
  if (phase === "school-morning") {
    return { sleep: "鬧鐘響了三次", mind: state.settings.reducedDistractions ? "事情很多，提示還在" : "每件事同時都很急", body: "還黏在床上", people: "老師已經提醒過", next: "07:42 的公車", unread: state.morning.distractions.length + 6 };
  }
  if (phase === "ordinary-day") {
    return { sleep: "六個半小時", mind: "普通地飄著", body: "有一點餓", people: "同學在傳很爛的梗圖", next: "回家買晚餐", unread: 8 };
  }
  if (phase === "teen-event" || phase === "wrong-explanation") {
    return { sleep: state.teenPattern === "surge" ? "兩晚加起來不到五小時" : "睡過，還是像沒睡", mind: state.teenPattern === "perception" ? "每句話都要確認" : "很難安靜", body: state.teenPattern === "alarm" ? "還在警戒" : "跟不上自己", people: "不想被問", next: "明天第一節要點名", unread: 14 };
  }
  if (phase === "counselor") {
    return { sleep: "四個小時", mind: "想說的話排成一長串", body: "肩膀很緊", people: "門外有人等", next: "回答：家裡還好嗎？", unread: 17 };
  }
  if (phase === "clinic-trip" || phase === "clinic-room" || phase === "memory-return") {
    return { sleep: "五個小時", mind: "把話重新排一次", body: "餓了，也有點想吐", people: "候診室很多人", next: "下午還要回學校", unread: 21 };
  }
  if (phase === "moving-out") {
    return { sleep: "紙箱旁邊睡了五小時", mind: "什麼都怕忘", body: "手臂很痠", people: "家裡一直問帶齊了嗎", next: "17:00 前交屋", unread: 12 };
  }
  if (phase === "first-work") {
    return { sleep: "六小時", mind: "記住每個人的名字", body: "站了七個小時", people: "同事在約下班吃飯", next: "明天 08:30 打卡", unread: 18 };
  }
  if (phase === "relationship") {
    return { sleep: "昨晚一直看手機", mind: "同一句話讀了十次", body: "胃縮在一起", people: "阿沐還沒回覆", next: "決定要傳出哪一句", unread: 3 };
  }
  if (phase === "masking-work" || phase === "work-disclosure") {
    return { sleep: "三小時四十分", mind: "維持普通表情", body: "咖啡壓著手抖", people: "主管今天會找你", next: "完成下午簡報", unread: 27 };
  }
  if (phase === "adult-clinic") {
    return { sleep: "五小時", mind: "請假理由演練完畢", body: "餓，藥袋也快空了", people: "候診還有七號", next: "14:00 前回公司", unread: 31 };
  }
  if (phase === "career-project") {
    return { sleep: "昨晚六個半小時", mind: "這份工作你真的會做", body: "肩頸很硬", people: "團隊在等你的決定", next: "週五前交付專案", unread: 22 };
  }
  if (phase === "caregiving") {
    return { sleep: "被兩通電話叫醒", mind: "兩張掛號單疊在一起", body: "還沒吃早餐", people: "每個人都說只有那天有空", next: "安排明天的陪診", unread: 36 };
  }
  if (phase === "system-dungeon") {
    return { sleep: "六小時", mind: "影本、正本、第二份正本", body: "排隊站到腰痠", people: "窗口說還少一張", next: "16:30 前回到一樓", unread: 19 };
  }
  if (phase === "group-chat") {
    return { sleep: "群組聊到 01:24", mind: "不用每句都翻譯", body: "坐太久腳麻", people: "有人問晚餐吃了沒", next: "明天上班，真的要睡", unread: 48 };
  }
  if (phase === "adult-ordinary-day") {
    return { sleep: "七小時，難得", mind: "今天還算安靜", body: "膝蓋有點痠", people: "朋友傳了貓的影片", next: "下班買豆花", unread: 9 };
  }
  if (phase === "aging" || phase === "memory-review") {
    return { sleep: "半夜醒兩次", mind: "名字偶爾慢一拍", body: "走路要留一點時間", people: "群組有人換了第三次暱稱", next: "整理下週的藥盒", unread: 14 };
  }
  if (phase === "last-day") {
    return { sleep: "午睡了一會", mind: "沒有急著解釋什麼", body: "今天走得比較慢", people: "晚安還沒傳", next: "替植物澆水", unread: 6 };
  }
  return state.signals;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "NEW_LIFE":
      return createLife(action.seed, action.settings ?? state.settings);
    case "HYDRATE": {
      if (action.state.version !== 2) return state;
      const base = createLife(action.state.seed, action.state.settings);
      return {
        ...base,
        ...action.state,
        counters: { ...base.counters, ...action.state.counters },
        adultActions: action.state.adultActions ?? [],
        groupReplies: action.state.groupReplies ?? [],
        chapterProgress: action.state.chapterProgress ?? 0,
      };
    }
    case "GO": {
      const next = { ...state, phase: action.phase, age: action.age ?? state.age, chapterProgress: action.phase === state.phase ? state.chapterProgress : 0, lastText: action.text ?? state.lastText };
      return { ...next, signals: signalsForPhase(next, action.phase) };
    }
    case "SET_SETTING": {
      const next = { ...state, settings: { ...state.settings, [action.key]: action.value } };
      return { ...next, signals: signalsForPhase(next, next.phase) };
    }
    case "INSPECT":
      return {
        ...state,
        explored: state.explored.includes(action.objectId) ? state.explored : [...state.explored, action.objectId],
        memories: addMemory(state.memories, action.memoryId),
        lastText: action.text,
      };
    case "APPLY_CHOICE": {
      const flags = { ...state.flags };
      action.flags?.forEach((flag) => { flags[flag] = true; });
      const next = {
        ...state,
        phase: action.next ?? state.phase,
        age: action.age ?? state.age,
        flags,
        traits: applyEffects(state.traits, action.effects),
        counters: addCounters(state.counters, action.counters),
        lastText: action.text,
      };
      return { ...next, signals: signalsForPhase(next, next.phase) };
    }
    case "MORNING_ACTION": {
      const attempts = { ...state.morning.attempts, [action.actionId]: (state.morning.attempts[action.actionId] ?? 0) + 1 };
      const sleepWeight = state.traits.sleepDebt + (100 - state.traits.attentionRegulation) * 0.35;
      const needed = action.actionId === "bed" ? (sleepWeight > 72 ? 3 : 2) : 1;
      const done = attempts[action.actionId] >= needed;
      const completed = done && !state.morning.completed.includes(action.actionId)
        ? [...state.morning.completed, action.actionId]
        : state.morning.completed;
      const retried = !done ? 1 : 0;
      const forgot = action.actionId === "door" && !state.morning.completed.includes("keys") ? 1 : 0;
      const text = action.actionId === "bed" && !done
        ? attempts[action.actionId] === 1 ? "你按了『起床』。畫面沒有壞。角色只是還坐不起來。" : "等一下。再一下。公車時間沒有一起停下來。"
        : action.actionId === "bed" ? "第二次之後，腳終於碰到地板。" : state.lastText;
      return {
        ...state,
        morning: { ...state.morning, attempts, completed, actions: state.morning.actions + 1 },
        counters: addCounters(state.counters, { actionRetries: retried, forgotWhy: forgot }),
        lastText: text,
      };
    }
    case "ADD_DISTRACTION":
      return {
        ...state,
        morning: {
          ...state.morning,
          distractions: state.morning.distractions.includes(action.distractionId) ? state.morning.distractions : [...state.morning.distractions, action.distractionId],
          listHidden: !state.settings.reducedDistractions,
        },
        counters: addCounters(state.counters, { forgotWhy: state.settings.reducedDistractions ? 0 : 1 }),
        lastText: state.settings.reducedDistractions ? "手機在震。待辦提示仍留在旁邊。" : "你回過神。剛剛到底要拿什麼？",
      };
    case "CLEAR_DISTRACTIONS":
      return { ...state, morning: { ...state.morning, distractions: [], listHidden: false }, lastText: "視窗關掉了。時間沒有回來。" };
    case "TEEN_ACTION":
      return {
        ...state,
        teenActions: state.teenActions.includes(action.actionId) ? state.teenActions : [...state.teenActions, action.actionId],
        traits: applyEffects(state.traits, action.effects),
        lastText: action.text,
      };
    case "ADULT_ACTION": {
      const flags = { ...state.flags };
      action.flags?.forEach((flag) => { flags[flag] = true; });
      return {
        ...state,
        flags,
        adultActions: state.adultActions.includes(action.actionId) ? state.adultActions : [...state.adultActions, action.actionId],
        traits: applyEffects(state.traits, action.effects),
        counters: addCounters(state.counters, action.counters),
        lastText: action.text,
      };
    }
    case "GROUP_REPLY":
      return {
        ...state,
        groupReplies: state.groupReplies.includes(action.replyId) ? state.groupReplies : [...state.groupReplies, action.replyId],
        traits: applyEffects(state.traits, action.effects),
        counters: addCounters(state.counters, action.counters),
        lastText: action.text,
      };
    case "ADVANCE_PROGRESS":
      return { ...state, chapterProgress: state.chapterProgress + 1, lastText: action.text };
    case "RESET_PROGRESS":
      return { ...state, chapterProgress: 0 };
    case "CLINIC_NEXT":
      return { ...state, clinicStep: state.clinicStep + 1, lastText: action.text };
    case "REINTERPRET_MEMORY":
      return {
        ...state,
        memories: state.memories.map((memory) => memory.id === action.memoryId
          ? { ...memory, interpretation: action.interpretation, reinterpretAtAge: action.age ?? 17 }
          : memory),
        lastText: action.interpretation,
      };
    case "UNLOCK_MEMORY":
      return { ...state, memories: addMemory(state.memories, action.memoryId) };
    case "SET_TEXT":
      return { ...state, lastText: action.text };
    default:
      return state;
  }
}
