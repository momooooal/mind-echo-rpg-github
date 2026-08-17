"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { DialogueBox } from "./game/components/DialogueBox";
import { GameScene, type SceneObject } from "./game/components/GameScene";
import { MemoryBook } from "./game/components/MemoryBook";
import { PauseMenu } from "./game/components/PauseMenu";
import { StatusSignals } from "./game/components/StatusSignals";
import { CHILDHOOD_OBJECTS, CLINIC_TIMELINE, FUTURE_CHAPTERS, TEEN_EVENTS } from "./game/data/events";
import { getFamilySeed } from "./game/data/families";
import { createHomeState, freshSeed } from "./game/engine/createGame";
import { gameReducer } from "./game/engine/reducer";
import type { AccessibilitySettings, Phase, TeenPattern } from "./game/types";

const SAVE_KEY = "echo-life-rpg-save-v2";

const LIFE_STAGES = [
  ["0–5", ["notice", "birth"]],
  ["6–12", ["childhood-room", "family-talk", "school-morning"]],
  ["13–18", ["ordinary-day", "teen-event", "wrong-explanation", "counselor", "clinic-trip", "clinic-room", "memory-return"]],
  ["19–25", []], ["26–35", []], ["36–50", []], ["51–65", []], ["65+", []],
] as const;

const DISTRACTIONS = [
  ["boss", "班導", "昨天那張回條呢？"],
  ["group", "班群 · 27", "有人又把老師做成梗圖"],
  ["washer", "洗衣機", "嗶、嗶、嗶——"],
  ["video", "短影片", "再看一個就好"],
  ["alarm", "鬧鐘", "07:34　稍後提醒"],
  ["weather", "天氣", "下午降雨 70%"],
  ["thought", "腦袋", "等一下，我是不是還沒——"],
] as const;

const SURGE_TASKS = [
  ["project", "開一個新企劃", "先把資料夾建好，名字很酷。"],
  ["room", "整理整個房間", "凌晨一點，衣櫃全部倒在床上。"],
  ["slides", "做四十頁簡報", "明明只需要十分鐘報告。"],
  ["shop", "買三支不同用途的筆", "還順便加入購物車七樣東西。"],
  ["messages", "回完所有人的訊息", "又答應兩個週末邀約。"],
  ["course", "報名線上課程", "這次一定可以學會。"],
  ["trip", "規劃一趟旅行", "票價、住宿、景點同時開著。"],
] as const;

const PATTERN_COPY: Record<TeenPattern, { kicker: string; title: string; intro: string; rationalization: string; thought: string }> = {
  surge: { kicker: "16 歲 · 星期三 · 23:08", title: "今晚什麼都做得到", intro: "滑鼠移動得比平常快。每完成一件事，又會想到三件更好的事。", rationalization: "你最近很有效率啊。年輕人少睡一點沒差吧？", thought: "前幾天真的很厲害。可是今天連制服都換不下來。" },
  low: { kicker: "16 歲 · 星期一 · 06:58", title: "只是一件很小的事", intro: "今天要洗澡、回老師一封信、去學校。每件事都只有一個按鈕。", rationalization: "大家都不想上學啊。不要把懶惰想得那麼嚴重。", thought: "對啊，只是一封信。我也不知道為什麼沒有辦法。" },
  perception: { kicker: "17 歲 · 車站 · 17:42", title: "每一句都要再確認一次", intro: "月台很吵。有人說話，你不確定那句話是不是和你有關。", rationalization: "你就是太在意別人怎麼看。大家根本沒空管你。", thought: "也許真的沒人在講我。可是每一次都要確認，好累。" },
  alarm: { kicker: "15 歲 · 學校走廊 · 12:21", title: "身體比你更早聽見", intro: "午休結束，一扇門在你身後突然關上。事情只發生了一秒。", rationalization: "只是關門大聲一點。你不要每次都那麼誇張。", thought: "我知道只是一扇門。身體不知道。" },
};

function stageForPhase(phase: Phase) {
  return LIFE_STAGES.findIndex(([, phases]) => (phases as readonly string[]).includes(phase));
}

function LifeRail({ phase }: { phase: Phase }) {
  const current = stageForPhase(phase);
  return <nav className="life-rail" aria-label="人生階段">{LIFE_STAGES.map(([label], index) => <span key={label} className={index === current ? "current" : index < current ? "past" : "future"}><i aria-hidden="true" />{label}</span>)}</nav>;
}

function SceneHeading({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return <header className="scene-heading"><p>{kicker}</p><h1>{title}</h1><div>{children}</div></header>;
}

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createHomeState);
  const [ready, setReady] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [paused, setPaused] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [doorPrompt, setDoorPrompt] = useState(false);
  const family = useMemo(() => getFamilySeed(state.familyId), [state.familyId]);

  useEffect(() => {
    // Browser storage is intentionally device-local; the game sends no player data elsewhere.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSave(Boolean(window.localStorage.getItem(SAVE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || state.phase === "home") return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSave(true);
  }, [ready, state]);

  const go = (phase: Phase, age?: number, text?: string) => {
    dispatch({ type: "GO", phase, age, text });
    window.scrollTo({ top: 0, behavior: state.settings.reducedDistractions ? "auto" : "smooth" });
  };

  const newLife = () => {
    window.localStorage.removeItem(SAVE_KEY);
    dispatch({ type: "NEW_LIFE", seed: freshSeed(), settings: state.settings });
    setHasSave(false);
  };

  const resume = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "") as typeof state;
      if (saved.version !== 2) throw new Error("old save");
      dispatch({ type: "HYDRATE", state: saved });
    } catch { newLife(); }
  };

  const setSetting = (key: keyof AccessibilitySettings, value: boolean) => dispatch({ type: "SET_SETTING", key, value });

  if (state.phase === "home") {
    return <main className="landing">
      <header className="landing-bar"><div className="logo-tile">回</div><p>人生模擬 × 養成 RPG × 敘事解謎</p><a href="#about">這是什麼</a></header>
      <section className="landing-hero">
        <div className="landing-copy"><span className="tape-label">可遊玩章節 · 0–18 歲</span><h1>一生的<br /><em>回聲</em></h1><p>你不是要扮演一個精神疾病患者。你只是活著，後來才慢慢知道，原來有些事情別人不用這麼用力。</p><div className="landing-actions"><button type="button" className="main-action" onClick={newLife}>出生</button>{hasSave && <button type="button" onClick={resume}>回到上次停下的地方</button>}</div><small>一輪約 20–30 分鐘 · 沒有疾病選單 · 沒有好壞結局</small></div>
        <div className="landing-room" aria-hidden="true"><div className="pixel-window"><i /><i /><i /></div><div className="room-lamp" /><div className="room-sofa" /><div className="room-table"><i /><b /></div><div className="tiny-person" /><span className="clock-card">02:13<br /><small>客廳還亮著</small></span><span className="receipt-card">○○身心○○<br />第 071 號</span><span className="note-card">不要跟老師說</span></div>
      </section>
      <section className="landing-about" id="about"><article><span>你會做的事</span><p>翻垃圾桶、找聯絡簿、忘記鑰匙、按三次才起床、在候診室看號碼，以及把想說的話刪掉。</p></article><article><span>這一輪不會告訴你</span><p>你「抽到」什麼病。家庭、睡眠、壓力、先天敏感與偶發事件會在看不見的地方互相影響。</p></article><article><span>資料界線</span><p>角色與事件皆為融合後重新創作；沒有真實群名、成員、病歷、原句或可辨識經歷。</p></article></section>
    </main>;
  }

  const shell = (content: React.ReactNode, options?: { wide?: boolean; hideSignals?: boolean }) => <main className={`game-shell ${state.settings.softMode ? "soft-mode" : ""} ${state.settings.reducedDistractions ? "reduced-distractions" : ""}`}>
    <header className="game-bar"><button type="button" className="logo-tile" onClick={() => setPaused(true)} aria-label="暫停遊戲">回</button><div><span>{state.age ? `${state.age} 歲` : "生命開始"}</span><b>一生的回聲</b></div><button type="button" onClick={() => setPhoneOpen((open) => !open)}>手機</button><button type="button" onClick={() => setMemoryOpen(true)}>記憶 <i>{state.memories.length}</i></button><button type="button" onClick={() => setPaused(true)}>暫停</button></header>
    <LifeRail phase={state.phase} />
    <div className={`game-content ${options?.wide ? "wide" : ""}`}><section className="play-column">{content}</section>{!options?.hideSignals && <StatusSignals signals={state.signals} />}</div>
    {phoneOpen && <div className="phone-popover"><StatusSignals signals={state.signals} /><button type="button" onClick={() => setPhoneOpen(false)}>收起手機</button></div>}
    {memoryOpen && <MemoryBook memories={state.memories} onClose={() => setMemoryOpen(false)} />}
    {paused && <PauseMenu settings={state.settings} onSetting={setSetting} onClose={() => setPaused(false)} onExit={() => { setPaused(false); go("home"); }} />}
  </main>;

  if (state.phase === "notice") return shell(<div className="notice-screen"><span className="tape-label">開始以前</span><h1>這是一段人生。<br />不是測驗，也不是診斷。</h1><div className="notice-cards"><article><b>內容</b><p>家庭衝突、無法理解的身心狀態、污名與求助。沒有具體傷害方式，也沒有以生命危機作為結局。</p></article><article><b>控制</b><p>角色不一定第一次就照你的指令做。這是玩法的一部分，不是網頁壞掉。</p></article><article><b>離開</b><p>隨時可以暫停、降低干擾、查看即時資源。進度只保存在這台裝置。</p></article></div><div className="setting-row"><label><input type="checkbox" checked={state.settings.softMode} onChange={(event) => setSetting("softMode", event.target.checked)} />柔和文字</label><label><input type="checkbox" checked={state.settings.reducedDistractions} onChange={(event) => setSetting("reducedDistractions", event.target.checked)} />降低干擾效果</label></div><button type="button" className="main-action" onClick={() => go("birth", 0)}>繼續</button></div>, { hideSignals: true });

  if (state.phase === "birth") return shell(<div className="birth-screen"><p>0 歲 · 沒有角色建立畫面</p><h1>你出生了。</h1><div className="seed-machine" aria-label="遊戲正在建立隱藏生命條件"><i /><i /><i /><i /><i /><i /><span>先天敏感 × 家庭 × 資源 × 偶發事件</span></div><blockquote>{family.opening}</blockquote><p className="quiet-copy">遊戲已建立一組不會直接顯示的生命參數。沒有任何一項單獨決定未來，也沒有哪種家庭必然導向疾病。</p><button type="button" className="main-action" onClick={() => go("childhood-room", 7, family.roomTone)}>先學會看大人的臉</button></div>, { hideSignals: true });

  if (state.phase === "childhood-room") {
    const roomObjects: SceneObject[] = CHILDHOOD_OBJECTS.map((object) => ({ ...object, visited: state.explored.includes(object.id) }));
    const canLeave = state.explored.length >= 5 && state.explored.includes("bag");
    return shell(<><SceneHeading kicker="第一章 · 7 歲 · 凌晨 02:13" title="客廳還亮著">七歲的你不知道正確答案。你只能走過去、看一下，然後記住。第一個房間會替可點物件畫上手繪外框。</SceneHeading><div className="scene-layout"><GameScene className="childhood-home" label="七歲家中的客廳，可點擊物件探索" objects={roomObjects} onInteract={(id) => { const object = CHILDHOOD_OBJECTS.find((item) => item.id === id); const memoryId = object && "memoryId" in object ? object.memoryId : undefined; dispatch({ type: "INSPECT", objectId: id, memoryId, text: family.objectText[id] ?? "你看了一會，還是不知道那代表什麼。" }); }}><span className="scene-time">02:13</span></GameScene><aside className="observation-card"><span>你現在知道的</span><p>{state.lastText}</p><div>{state.explored.length} 樣東西看過了</div>{canLeave ? <button type="button" className="main-action" onClick={() => go("family-talk", 7, family.breakfast)}>把這些放進記憶裡</button> : <small>{state.explored.includes("bag") ? "再看看幾樣東西。" : "桌上有一個不能碰的白色袋子。"}</small>}</aside></div></>, { wide: true });
  }

  if (state.phase === "family-talk") {
    const done = state.flags.familyTalkDone;
    return shell(<><SceneHeading kicker="第一章 · 7 歲 · 隔天 11:46" title="不要去吵媽媽">{family.breakfast}</SceneHeading><div className="small-scene family-kitchen"><div className="adult-shape" /><div className="child-shape" /><span className="cold-toast">早餐冷了</span></div>{!done ? <DialogueBox speaker="爸爸" text={family.secrecyLine} thought="昨晚的人和今天躺在房裡的人，真的是同一個媽媽嗎？" choices={[{ id: "ask", label: "昨天晚上她一直說話。", subtext: "話到嘴邊只剩一半。" }, { id: "okay", label: "好。" }, { id: "silence", label: "……", subtext: "不回答也是一種回答。" }]} onChoose={(id) => { const ask = id === "ask"; dispatch({ type: "UNLOCK_MEMORY", memoryId: "family-rule" }); dispatch({ type: "APPLY_CHOICE", effects: ask ? { socialSupport: 3, masking: -2 } : { masking: 8, selfBlame: 3 }, flags: ["familyTalkDone", "familySecrecy", ...(ask ? ["questionedFamily"] : [])], counters: id === "okay" ? { pretendedOkay: 1 } : undefined, text: ask ? "爸爸把杯子移到另一邊：『大人的事很複雜。你長大就會懂。』" : id === "okay" ? "爸爸鬆了一口氣。你得到一個很有用的技能：讓大人放心。" : "冰箱運轉的聲音填滿整個廚房。沒有人再問。" }); }} /> : <div className="consequence-dialogue"><span>爸爸</span><p>{state.lastText}</p><small>沒有旁白替這一幕下結論。</small></div>}{done && <button type="button" className="main-action next-scene" onClick={() => go("school-morning", 12)}>五年後，一個上學日</button>}</>);
  }

  if (state.phase === "school-morning") {
    const completed = state.morning.completed;
    const outOfBed = completed.includes("bed");
    const openSevenWindows = () => DISTRACTIONS.forEach(([id]) => dispatch({ type: "ADD_DISTRACTION", distractionId: id }));
    const morningObjects: SceneObject[] = [
      { id: "bed", label: outOfBed ? "床" : "起床", icon: "床", className: "morning-bed", visited: outOfBed },
      { id: "clothes", label: "制服", icon: "衣", className: "morning-closet", visited: completed.includes("clothes") },
      { id: "notebook", label: "聯絡簿", icon: "簿", className: "morning-desk", visited: completed.includes("notebook") },
      { id: "phone", label: "手機", icon: "訊", className: "morning-phone", visited: state.morning.distractions.length > 0 },
      { id: "washer", label: "洗衣機", icon: "洗", className: "morning-washer" },
      { id: "keys", label: "鑰匙", icon: "匙", className: "morning-keys", visited: completed.includes("keys") },
      { id: "shoes", label: "鞋子", icon: "鞋", className: "morning-shoes", visited: completed.includes("shoes") },
      { id: "door", label: "出門", icon: "門", className: "morning-door" },
    ];
    const interact = (id: string) => {
      if (id === "bed") return dispatch({ type: "MORNING_ACTION", actionId: "bed" });
      if (!outOfBed) return dispatch({ type: "SET_TEXT", text: "你知道東西都在房間裡。角色還坐在床邊。再按一次起床。" });
      if (id === "phone") return openSevenWindows();
      if (id === "washer") return dispatch({ type: "ADD_DISTRACTION", distractionId: "washer" });
      if (id === "door") { dispatch({ type: "MORNING_ACTION", actionId: "door" }); setDoorPrompt(true); return; }
      dispatch({ type: "MORNING_ACTION", actionId: id });
      if (id === "notebook" && !state.settings.reducedDistractions) openSevenWindows();
      dispatch({ type: "SET_TEXT", text: id === "keys" ? "鑰匙在冰箱旁邊。你完全不記得為什麼會在那裡。" : id === "notebook" ? "聯絡簿找到了。手機在同一秒震了一下。" : id === "clothes" ? "制服穿反一次。你重穿。" : "鞋帶今天先不要追求對稱。" });
    };
    const leaveMorning = () => {
      if (!completed.includes("notebook")) dispatch({ type: "UNLOCK_MEMORY", memoryId: "left-behind" });
      if ((state.morning.attempts.bed ?? 0) > 1) dispatch({ type: "UNLOCK_MEMORY", memoryId: "three-clicks" });
      dispatch({ type: "APPLY_CHOICE", next: "ordinary-day", age: 14, effects: { sleepDebt: 5, selfBlame: completed.includes("notebook") ? 0 : 5 }, flags: ["finishedMorning", ...(completed.includes("notebook") ? [] : ["forgotNotebook"])], counters: { missedBus: state.morning.actions > 9 ? 1 : 0 }, text: completed.includes("notebook") ? "你趕上下一班車。今天帶齊了東西，卻像已經過完半天。" : "到校門口，你才想起聯絡簿還在桌上。" });
      setDoorPrompt(false);
    };
    return shell(<><SceneHeading kicker="第二章 · 12 歲 · 07:31" title="我剛剛到底要幹嘛？">目標本來很簡單：起床、穿制服、拿聯絡簿、找鑰匙、穿鞋、出門。知道順序不代表角色會照順序動。</SceneHeading><div className="morning-hud"><div className={state.morning.listHidden ? "task-note hidden" : "task-note"}><span>出門前</span>{["bed", "clothes", "notebook", "keys", "shoes"].map((id) => <i key={id} className={completed.includes(id) ? "done" : ""}>{({ bed: "起床", clothes: "制服", notebook: "聯絡簿", keys: "鑰匙", shoes: "鞋子" } as Record<string, string>)[id]}</i>)}</div><b>07:{String(31 + Math.min(10, state.morning.actions)).padStart(2, "0")}</b></div><GameScene className="morning-room" label="十二歲上學前的房間" objects={morningObjects} onInteract={interact} /><div className="action-caption" role="status"><span>角色</span><p>{state.lastText}</p></div>{state.morning.distractions.length > 0 && <div className="distraction-field" aria-label="同時出現的干擾視窗">{DISTRACTIONS.filter(([id]) => state.morning.distractions.includes(id)).map(([id, from, text], index) => <button type="button" style={{ "--scatter": index } as React.CSSProperties} key={id} onClick={() => dispatch({ type: "SET_TEXT", text: `${from}：${text}` })}><span>{from}</span><p>{text}</p></button>)}<button type="button" className="clear-windows" onClick={() => dispatch({ type: "CLEAR_DISTRACTIONS" })}>全部先關掉</button></div>}{doorPrompt && <div className="door-prompt"><h2>現在出門？</h2><p>{completed.includes("notebook") ? "東西好像都帶了。『好像』。" : "腦中有一個空格。公車已經快到了。"}</p><button type="button" className="main-action" disabled={!completed.includes("keys") || !completed.includes("shoes") || !completed.includes("clothes")} onClick={leaveMorning}>拉開門</button><button type="button" onClick={() => setDoorPrompt(false)}>再找一下</button></div>}</>, { wide: true });
  }

  if (state.phase === "ordinary-day") {
    const ordinary = [["school", "上學", "第二節下課，朋友傳來一張很爛的梗圖。你笑到被老師看。"], ["food", "買晚餐", "超商飯糰第二件六折。你拿了口味比較怪的那個。"], ["video", "回家看影片", "本來只看一集。片尾播完，天還沒有塌下來。"], ["sleep", "睡覺", "今天居然就這樣過完了。"]] as const;
    const done = ordinary.filter(([id]) => state.flags[`ordinary-${id}`]).length;
    return shell(<div className="ordinary-day"><SceneHeading kicker="插頁 · 14 歲 · 沒有重大事件" title="今天什麼都沒有發生。">沒有揭露、沒有崩潰、沒有重要領悟。把一天過完就好。</SceneHeading><div className="ordinary-list">{ordinary.map(([id, label, text], index) => <button type="button" key={id} disabled={index !== done} className={state.flags[`ordinary-${id}`] ? "done" : ""} onClick={() => dispatch({ type: "APPLY_CHOICE", flags: [`ordinary-${id}`], counters: id === "food" ? { goodFood: 1 } : id === "school" ? { laughedHard: 1 } : id === "sleep" ? { ordinaryDays: 1 } : undefined, text })}><span>{String(index + 1).padStart(2, "0")}</span><b>{label}</b><p>{state.flags[`ordinary-${id}`] ? text : ""}</p></button>)}</div>{done === ordinary.length && <button type="button" className="main-action next-scene" onClick={() => go("teen-event", state.teenPattern === "perception" ? 17 : state.teenPattern === "alarm" ? 15 : 16)}>有一天，普通的做法不夠用了</button>}</div>);
  }

  if (state.phase === "teen-event") {
    const copy = PATTERN_COPY[state.teenPattern];
    const finishTeen = () => { const event = TEEN_EVENTS[state.teenPattern]; dispatch({ type: "UNLOCK_MEMORY", memoryId: "first-interference" }); dispatch({ type: "APPLY_CHOICE", next: "wrong-explanation", effects: event.hiddenEffects, flags: event.futureFlags, text: "你先替這件事找了一個普通理由。" }); };
    let game: React.ReactNode;
    if (state.teenPattern === "surge") {
      const full = state.teenActions.length >= 5;
      game = <><div className="surge-grid">{SURGE_TASKS.map(([id, label, note]) => <button type="button" key={id} disabled={state.teenActions.includes(id) || full} onClick={() => dispatch({ type: "TEEN_ACTION", actionId: id, effects: { sleepDebt: 3 }, text: note })}><span>{state.teenActions.includes(id) ? "已開始" : "+ 新任務"}</span><b>{label}</b></button>)}</div><div className="speed-caption">{state.lastText}</div>{full && <div className="crash-list"><span>兩天後 · 06:51</span><h2>未完成</h2><p>企劃、房間、簡報、課程、聚會、信用卡帳單、工作報告、睡眠。</p><button type="button" className="main-action" onClick={finishTeen}>按第四次鬧鐘</button></div>}</>;
    } else if (state.teenPattern === "low") {
      const tries = state.teenActions.filter((id) => id.startsWith("shower-")).length;
      const emailTries = state.teenActions.filter((id) => id.startsWith("email-")).length;
      game = <div className="low-game"><div className="heavy-room"><button type="button" onClick={() => dispatch({ type: "TEEN_ACTION", actionId: `shower-${tries + 1}`, effects: { selfBlame: tries < 2 ? 2 : -1 }, text: tries === 0 ? "按鈕沒有壞。角色只是沒有起來。" : tries === 1 ? "等一下。" : "第三次，角色坐到床邊。洗澡還在房間另一頭。" })}>洗澡</button><button type="button" onClick={() => dispatch({ type: "TEEN_ACTION", actionId: `email-${emailTries + 1}`, effects: { selfBlame: 1 }, text: emailTries === 0 ? "主旨：關於缺交作業……游標閃著。" : "你打了兩行，全部刪掉。未讀訊息變成 15。" })}>回老師的信</button><div className="message-stack"><span>朋友：你怎麼都不回？</span><span>班導：只是一封信。</span><span>你：對啊，只是一封信。</span></div></div><p className="speed-caption">{state.lastText}</p>{tries >= 3 && emailTries >= 2 && <button type="button" className="main-action" onClick={finishTeen}>今天先到這裡</button>}</div>;
    } else if (state.teenPattern === "perception") {
      const checks = state.teenActions.length;
      const fragments = ["……就是他……", "……制服……很怪……", "下一班……延誤……"];
      game = <div className="station-game"><div className="platform"><span className="train-line" /><div className="npc npc-a" /><div className="npc npc-b" /><div className="npc npc-c" /><p>{fragments[Math.min(checks, fragments.length - 1)]}</p></div><div className="reality-choices">{[["turn", "回頭確認"], ["move", "走到另一根柱子"], ["ask", "問：你剛剛叫我嗎？"]].map(([id, label], index) => <button type="button" key={id} disabled={state.teenActions.includes(id)} onClick={() => dispatch({ type: "TEEN_ACTION", actionId: id, effects: { sleepDebt: 2 }, text: index === 0 ? "他們還在說話，沒有看你。這沒有讓下一句變得更容易。" : index === 1 ? "換了位置。廣播、腳步和談話仍疊在一起。" : "對方愣了一下：『蛤？沒有啊。』" })}>{label}</button>)}</div><p className="speed-caption">{state.lastText}</p>{checks >= 3 && <button type="button" className="main-action" onClick={finishTeen}>下一班車來了</button>}</div>;
    } else {
      const reacted = state.teenActions.length > 0;
      game = <div className={`alarm-game ${reacted ? "released" : ""}`}><div className="corridor"><div className="slam-door" /><strong>{state.settings.softMode ? "碰。" : "砰。"}</strong><p>視野裡能選的東西突然變少。</p></div>{!reacted ? <div className="narrow-choices">{[["fine", "沒事。"], ["startled", "嚇到而已。"], ["leave", "我出去一下。"]].map(([id, label]) => <button type="button" key={id} onClick={() => dispatch({ type: "TEEN_ACTION", actionId: id, effects: id === "fine" ? { masking: 5 } : {}, text: id === "leave" ? "你走到樓梯間。手還在抖，至少不用解釋。" : `你說：『${label}』同學點點頭。` })}>{label}</button>)}</div> : <><p className="speed-caption">{state.lastText}</p><button type="button" className="main-action" onClick={finishTeen}>午休繼續</button></>}</div>;
    }
    return shell(<><SceneHeading kicker={copy.kicker} title={copy.title}>{copy.intro}</SceneHeading>{game}</>, { wide: true });
  }

  if (state.phase === "wrong-explanation") {
    const copy = PATTERN_COPY[state.teenPattern];
    const done = state.flags.wrongExplanationDone;
    return shell(<><SceneHeading kicker={`${state.age} 歲 · 隔天`} title="先找一個普通的理由">當事情還沒有名字，身邊的人和你都會用已知的答案把它填起來。</SceneHeading>{!done ? <DialogueBox speaker="同學／家人" text={copy.rationalization} thought={copy.thought} choices={[{ id: "busy", label: "最近比較忙。" }, { id: "haha", label: "哈哈，可能吧。" }, { id: "coffee", label: "咖啡喝太多啦。" }, { id: "unknown", label: "……我不知道。" }]} onChoose={(id) => dispatch({ type: "APPLY_CHOICE", flags: ["wrongExplanationDone", "maskedFirstInterference"], effects: id === "unknown" ? { selfBlame: -2 } : { masking: 5, selfBlame: 3 }, counters: id === "haha" ? { pretendedOkay: 1 } : undefined, text: id === "unknown" ? "對方停了一下：『喔。』上課鐘響了，話留在原地。" : "對方接受了這個答案。你也暫時接受。" })} /> : <div className="consequence-dialogue"><span>事情沒有因此消失</span><p>{state.lastText}</p></div>}{done && <button type="button" className="main-action next-scene" onClick={() => go("counselor", 17)}>幾週後，輔導室</button>}</>);
  }

  if (state.phase === "counselor") {
    const done = state.flags.counselorDone;
    const canSayMore = state.flags.questionedFamily || family.id === "warm";
    return shell(<><SceneHeading kicker="第四章 · 17 歲 · 輔導室" title="最近家裡還好嗎？">門外有人等。牆上的鐘走得很大聲。你知道真正的答案，但家裡的規則也一起坐在這裡。</SceneHeading><div className="counselor-room"><div className="plant-doodle" /><div className="tissue-box">面紙</div><span>14:52</span></div>{!done ? <><div className={`draft-note ${state.flags.draftDeleted ? "deleted" : ""}`}><span>如果說不出口，可以先寫</span><p>{state.flags.draftDeleted ? "（空白）" : "我其實最近已經……"}</p>{!state.flags.draftDeleted && <button type="button" onClick={() => dispatch({ type: "APPLY_CHOICE", flags: ["draftDeleted"], counters: { deletedMessages: 1 }, text: "你把那一行塗掉。紙沒有問為什麼。" })}>刪掉</button>}</div><DialogueBox speaker="輔導老師" text="不用一次講清楚。今天先告訴我，現在最難的是哪一件事？" thought="我好像已經撐不住普通的生活了，而且我不知道家裡能不能知道。" choices={[{ id: "fine", label: "還好。" }, { id: "normal", label: "普通。" }, { id: "silence", label: "……" }, { id: "unknown", label: "我不知道。" }, ...(canSayMore ? [{ id: "something", label: "有些事情好像不太對。", subtext: "這句話仍然沒有說完。" }] : [])]} onChoose={(id) => { const asked = id === "something" || id === "unknown"; dispatch({ type: "APPLY_CHOICE", flags: ["counselorDone", ...(asked ? ["askedForHelp"] : ["couldNotAskYet"])], effects: asked ? { professionalSupport: 12, masking: -4 } : { masking: 6 }, counters: asked ? { saidNotOkay: 1 } : id === "fine" ? { pretendedOkay: 1 } : undefined, text: asked ? "老師沒有說『大家都會』。她拿出一張轉介單，問你願不願意一起想下一步。" : "談話結束。兩週後，你又缺席一次；班導打電話給家裡，轉介仍然來了，只是繞了一段路。" }); }} /></> : <div className="consequence-dialogue"><span>輔導室 · 15:08</span><p>{state.lastText}</p><small>求助與沒有求助都會留下後續，不是答對或答錯。</small></div>}{done && <button type="button" className="main-action next-scene" onClick={() => go("clinic-trip", 17)}>前往第一次門診</button>}</>);
  }

  if (state.phase === "clinic-trip") {
    const current = CLINIC_TIMELINE[Math.min(state.clinicStep, CLINIC_TIMELINE.length - 1)];
    const complete = state.clinicStep >= CLINIC_TIMELINE.length;
    return shell(<><SceneHeading kicker="第五章 · 17 歲 · 星期四" title="看九分鐘的醫生，用掉一個上午">沒有「回診 → 支持增加」。你要真的走完起床、公車、捷運、掛號、等候、診間和領取資料。</SceneHeading><div className="clinic-timeline">{CLINIC_TIMELINE.map((item, index) => <article key={item.time} className={index < state.clinicStep ? "past" : index === state.clinicStep ? "now" : "future"}><time>{item.time}</time><div><b>{item.label}</b><p>{index <= state.clinicStep ? item.note : ""}</p></div></article>)}</div>{!complete ? <div className="waiting-action"><span>{current.time}</span><p>{current.note}</p><button type="button" className="main-action" onClick={() => dispatch({ type: "CLINIC_NEXT", text: current.note })}>{state.clinicStep === 4 ? "再等一個號碼" : "讓時間往前"}</button></div> : <button type="button" className="main-action next-scene" onClick={() => go("clinic-room", 17)}>診間門打開了</button>}</>, { wide: true });
  }

  if (state.phase === "clinic-room") {
    const spoken = state.flags.clinicSpoken;
    const treatment = state.flags.treatmentTalkDone;
    return shell(<><SceneHeading kicker="第五章 · 17 歲 · 11:37" title="九分鐘要從哪裡開始？">醫師看著轉介單，再看你。電腦游標停在空白欄位。</SceneHeading><div className="clinic-desk"><span>第 071 號</span><div className="paper-stack" /><div className="white-bag-prop">○○身心○○</div></div>{!spoken && <DialogueBox speaker="醫師" text="最近最影響生活的是什麼？" thought={PATTERN_COPY[state.teenPattern].thought} choices={[{ id: "sleep", label: "睡不太好。" }, { id: "life", label: "我連普通事情都做不完。" }, { id: "fine", label: "其實還好。" }, { id: "paper", label: "把輔導室那張紙推過去。" }]} onChoose={(id) => dispatch({ type: "APPLY_CHOICE", flags: ["clinicSpoken"], effects: id === "fine" ? { masking: 4 } : { professionalSupport: 5 }, counters: id === "life" ? { saidNotOkay: 1 } : id === "fine" ? { pretendedOkay: 1 } : undefined, text: id === "fine" ? "醫師問了第二次：『那為什麼今天會來？』你看著桌上的白色袋子。" : "醫師把你的睡眠、身體反應與生活干擾分開記下。沒有一個格子寫得下全部。" })} />}{spoken && !treatment && <div className="treatment-talk"><div className="consequence-dialogue"><span>醫師</span><p>{state.lastText}</p></div><h2>談到治療時，你最先想到生活。</h2><p>藥物、心理支持與作息調整都可能有幫助，也各自需要時間與取捨。遊戲不替你決定治療。</p><div className="plain-choices"><button type="button" onClick={() => dispatch({ type: "APPLY_CHOICE", flags: ["treatmentTalkDone"], effects: { professionalSupport: 5 }, text: "你說早上已經很難起來，最怕再更想睡。醫師把『白天嗜睡』圈起來，約好下次一起看紀錄。" })}>說出：我最怕早上更起不來。</button><button type="button" onClick={() => dispatch({ type: "APPLY_CHOICE", flags: ["treatmentTalkDone"], effects: { masking: 2 }, text: "你先點頭，把想問的副作用留在喉嚨裡。藥袋拿在手上，比記憶裡更重。" })}>先點頭，不問。</button><button type="button" onClick={() => dispatch({ type: "APPLY_CHOICE", flags: ["treatmentTalkDone"], effects: { professionalSupport: 7 }, text: "你問能不能把睡眠、食慾和上課狀況記下來，下次再討論。這不是保證有效，只是讓生活也進入診間。" })}>問：可以先記生活影響，下次再談嗎？</button></div></div>}{treatment && <><div className="consequence-dialogue"><span>11:46 · 看診結束</span><p>{state.lastText}</p></div><button type="button" className="main-action next-scene" onClick={() => go("memory-return", 17)}>你看見袋子上的院徽</button></>}</>);
  }

  if (state.phase === "memory-return") {
    const whiteBag = state.memories.find((memory) => memory.id === "white-bag");
    const interpreted = Boolean(whiteBag?.interpretation);
    return shell(<><SceneHeading kicker="第六章 · 17 歲 · 醫院走廊" title="……我是不是看過這個？">不是跳出答案。是一個畫面先回來：凌晨、客廳、桌邊不能碰的袋子。</SceneHeading><div className="memory-replay"><article><span>7 歲</span><h2>{whiteBag?.titleAtTime ?? "白色袋子"}</h2><p>{whiteBag?.descriptionAtTime ?? "上面很多看不懂的字。"}</p></article><i aria-hidden="true">↔</i><article><span>17 歲</span><h2>手上的袋子</h2><p>同樣的紙、同樣的摺線。院徽像一個你差點想起的字。</p></article></div>{!interpreted ? <button type="button" className="main-action next-scene" onClick={() => dispatch({ type: "REINTERPRET_MEMORY", memoryId: "white-bag", interpretation: family.clinicInterpretation })}>讓記憶翻到背面</button> : <><div className="reinterpretation"><span>記憶碎片更新，但沒有全部解答</span><p>{whiteBag?.interpretation}</p><small>房門裡說過什麼、答錄機刪掉什麼，仍可能永遠不知道。</small></div><button type="button" className="main-action next-scene" onClick={() => go("slice-ending", 18)}>十八歲生日</button></>}</>);
  }

  return shell(<div className="slice-ending"><span className="tape-label">第一階段結束 · 18 歲</span><h1>你還不知道<br />這一生會叫什麼。</h1><p>你只知道：有些早晨，別人一個按鈕就能完成的事，你要按三次。有些話不是不知道，而是到嘴邊會變成別的話。</p><blockquote>病歷以後會記錄很多事情，但不會記錄全部的人生。</blockquote><section className="future-map"><header><span>這一生還會繼續</span><p>成年段已保留事件槽與長期旗標；下一階段會逐幕擴寫，不以摘要冒充遊戲。</p></header>{FUTURE_CHAPTERS.map((chapter) => <article key={chapter.age}><b>{chapter.age}</b><div><h2>{chapter.title}</h2><p>{chapter.systems.join(" · ")}</p></div><span>待開放</span></article>)}</section><div className="ending-actions"><button type="button" className="main-action" onClick={newLife}>出生在另一個家庭</button><button type="button" onClick={() => setMemoryOpen(true)}>翻開這一輪的記憶</button></div></div>, { wide: true, hideSignals: true });
}
