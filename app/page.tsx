"use client";

import { useEffect, useMemo, useState } from "react";

type Step =
  | "home" | "notice" | "birth" | "room" | "family" | "school"
  | "path" | "clinic" | "day" | "work" | "care" | "group"
  | "plan" | "legacy" | "ending";

type PathKey = "mood" | "attention" | "perception" | "trauma";
type Stats = { energy: number; safety: number; connection: number; support: number };
type Delta = Partial<Stats>;
type Feedback = { title: string; body: string; next: Step } | null;

const SAVE_KEY = "echo-life-rpg-save-v1";
const INITIAL_STATS: Stats = { energy: 56, safety: 44, connection: 48, support: 18 };

const ages = [
  { step: "birth", age: "00" }, { step: "room", age: "07" },
  { step: "school", age: "12" }, { step: "path", age: "17" },
  { step: "day", age: "26" }, { step: "work", age: "33" },
  { step: "care", age: "45" }, { step: "group", age: "57" },
  { step: "plan", age: "68" }, { step: "legacy", age: "82" },
] as const;

const stepIndex: Record<Step, number> = {
  home: -1, notice: -1, birth: 0, room: 1, family: 1, school: 2,
  path: 3, clinic: 3, day: 4, work: 5, care: 6, group: 7,
  plan: 8, legacy: 9, ending: 10,
};

const pathInfo: Record<PathKey, { label: string; short: string; detail: string; lens: string }> = {
  mood: {
    label: "能量像潮汐",
    short: "有些日子快得停不下來，有些日子連起身都很重。",
    detail: "你走過的是情緒與能量波動的路線。睡眠、衝動與低潮會影響日常，但它們不等於你整個人。",
    lens: "今天的世界忽然很快，明天也可能重得推不動。",
  },
  attention: {
    label: "注意力有很多頻道",
    short: "你不是沒聽見，而是所有聲音都同時太大聲。",
    detail: "你走過的是注意力與執行功能困難的路線。遲到、遺漏和啟動困難不是簡單的不用心。",
    lens: "老師說了一句話，你的腦中卻同時開了七個視窗。",
  },
  perception: {
    label: "現實偶爾起霧",
    short: "有時很難判斷，那個聲音是從房間裡，還是心裡傳來。",
    detail: "你走過的是知覺與現實感受擾動的路線。有這些經驗不代表暴力，也不會抹去一個人的判斷與感情。",
    lens: "你需要花力氣確認，別人不必確認的事。",
  },
  trauma: {
    label: "身體一直守夜",
    short: "事情已經過去，警報器卻還留在身體裡。",
    detail: "你走過的是創傷警覺的路線。閃回、迴避與過度警醒是求生系統留下的反應，不是脆弱。",
    lens: "一個關門聲，就能讓身體先回到很多年前。",
  },
};

const roomClues = [
  { id: "bag", label: "白色藥袋", text: "袋上寫著『睡前、情緒穩定』。你只認得媽媽的名字。" },
  { id: "receipts", label: "購物收據", text: "同一天的七張收據。昨晚她說，這些東西以後都用得到。" },
  { id: "calendar", label: "月曆紅圈", text: "『回診』被圈了三次，其中一次正好是她沒來接你的那天。" },
];

const morningTasks = [
  { id: "homework", label: "找昨天寫好的作業", note: "老師說再忘一次，就要通知家裡。" },
  { id: "wake", label: "再叫一次還沒起床的媽媽", note: "她昨晚很晚才安靜下來。" },
  { id: "breakfast", label: "替自己裝一份早餐", note: "肚子已經在叫，但公車剩三分鐘。" },
  { id: "sister", label: "幫妹妹綁鞋帶", note: "她站在門口，快哭了。" },
  { id: "breathe", label: "先停十秒，好好呼吸", note: "胸口很緊，可是沒有人在等你。" },
  { id: "call", label: "打給阿姨求救", note: "你怕她又說：要體諒大人。" },
];

const dayTasks = [
  { id: "shift", label: "撐完八小時班", cost: 4, delta: { energy: -8, safety: 3 } },
  { id: "clinic", label: "搭兩班車去回診", cost: 3, delta: { energy: -3, safety: 10, support: 5 } },
  { id: "shower", label: "洗澡與換乾淨衣服", cost: 2, delta: { energy: 2, safety: 3 } },
  { id: "family", label: "陪家人吃晚餐", cost: 2, delta: { energy: -2, connection: 7 } },
  { id: "group", label: "在互助群組說一句近況", cost: 1, delta: { connection: 5, support: 7 } },
  { id: "laundry", label: "把堆三天的衣服洗完", cost: 2, delta: { energy: -3, safety: 2 } },
];

const groupReplies = [
  { id: "safe", text: "我在。你現在安全嗎？可以只回我一個數字。", kind: "supportive" },
  { id: "call", text: "先不要一個人。我能陪你聯絡1925，或找一位在附近的人。", kind: "supportive" },
  { id: "stay", text: "我不知道怎麼解決，但接下來十分鐘我可以陪你。", kind: "supportive" },
  { id: "bright", text: "不要想太多，往好處想就好了。", kind: "thin" },
  { id: "compare", text: "至少你還有家人，比很多人幸運了。", kind: "thin" },
  { id: "sleep", text: "快去睡一覺，醒來就沒事了。", kind: "thin" },
];

const planGroups = [
  { id: "sign", label: "我的警訊", options: ["連續兩晚沒睡", "突然不回任何訊息", "開始分不清聲音來源"] },
  { id: "person", label: "先找誰", options: ["懂我近況的朋友", "互助團體夥伴", "社區心理衛生中心"] },
  { id: "wish", label: "希望怎麼陪", options: ["先聽，不急著講道理", "陪我確認用藥與回診", "降低聲音與人群刺激"] },
  { id: "urgent", label: "需要立即協助時", options: ["打1925一起討論", "聯絡醫療院所", "有立即危險時打119或110"] },
];

const clamp = (value: number) => Math.max(0, Math.min(100, value));

function AgeRail({ step }: { step: Step }) {
  const current = stepIndex[step];
  return (
    <nav className="age-rail game-age-rail" aria-label="生命進度">
      {ages.map((item, index) => (
        <span className={index === current ? "age-now" : index < current ? "age-past" : ""} key={item.age}>
          {item.age}{index < ages.length - 1 && <i />}
        </span>
      ))}
      <span className={current >= 10 ? "age-now" : ""}>終</span>
    </nav>
  );
}

function StatPanel({ stats }: { stats: Stats }) {
  const items = [
    ["能量", stats.energy], ["安全感", stats.safety],
    ["連結", stats.connection], ["支持網", stats.support],
  ] as const;
  return (
    <aside className="stat-panel" aria-label="目前狀態">
      {items.map(([label, value]) => (
        <div className="stat" key={label}>
          <span>{label}</span><b>{value}</b>
          <div><i style={{ width: `${value}%` }} /></div>
        </div>
      ))}
      <p>這些不是生命值，也不決定輸贏。它們只是讓代價變得可見。</p>
    </aside>
  );
}

function Dialogue({ speaker, children, thought }: { speaker: string; children: React.ReactNode; thought?: string }) {
  return (
    <div className="dialogue-box">
      <span>{speaker}</span>
      <p>{children}</p>
      {thought && <em>你沒有說出口：{thought}</em>}
    </div>
  );
}

function ChoiceButton({ title, detail, onClick }: { title: string; detail?: string; onClick: () => void }) {
  return (
    <button className="choice-button" type="button" onClick={onClick}>
      <strong>{title}</strong>{detail && <span>{detail}</span>}<i aria-hidden="true">→</i>
    </button>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("home");
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [path, setPath] = useState<PathKey | null>(null);
  const [clues, setClues] = useState<string[]>([]);
  const [morning, setMorning] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [replies, setReplies] = useState<string[]>([]);
  const [plan, setPlan] = useState<Record<string, string>>({});
  const [legacy, setLegacy] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [log, setLog] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [softMode, setSoftMode] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydration is the first moment browser storage is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSave(Boolean(window.localStorage.getItem(SAVE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || step === "home" || step === "ending") return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({
      step, stats, path, clues, morning, selectedTasks, replies, plan, legacy, log, softMode,
    }));
    // Keep the home-screen resume affordance in sync with the browser save.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSave(true);
  }, [step, stats, path, clues, morning, selectedTasks, replies, plan, legacy, log, softMode, ready]);

  const currentAge = useMemo(() => {
    const index = stepIndex[step];
    return index >= 0 && index < ages.length ? ages[index].age : "";
  }, [step]);

  const updateStats = (delta: Delta) => setStats((old) => ({
    energy: clamp(old.energy + (delta.energy ?? 0)),
    safety: clamp(old.safety + (delta.safety ?? 0)),
    connection: clamp(old.connection + (delta.connection ?? 0)),
    support: clamp(old.support + (delta.support ?? 0)),
  }));

  const go = (next: Step) => {
    setFeedback(null);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const choose = (label: string, delta: Delta, title: string, body: string, next: Step) => {
    updateStats(delta);
    setLog((old) => [...old, label]);
    setFeedback({ title, body, next });
  };

  const newGame = () => {
    setStats(INITIAL_STATS); setPath(null); setClues([]); setMorning([]);
    setSelectedTasks([]); setReplies([]); setPlan({}); setLegacy("");
    setFeedback(null); setLog([]); setSoftMode(false);
    window.localStorage.removeItem(SAVE_KEY); setHasSave(false); go("notice");
  };

  const resumeGame = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}");
      setStats(saved.stats ?? INITIAL_STATS); setPath(saved.path ?? null);
      setClues(saved.clues ?? []); setMorning(saved.morning ?? []);
      setSelectedTasks(saved.selectedTasks ?? []); setReplies(saved.replies ?? []);
      setPlan(saved.plan ?? {}); setLegacy(saved.legacy ?? ""); setLog(saved.log ?? []);
      setSoftMode(saved.softMode ?? false); go(saved.step ?? "notice");
    } catch { newGame(); }
  };

  const completeMorning = () => {
    const caredForSelf = morning.includes("breakfast") || morning.includes("breathe");
    const askedHelp = morning.includes("call");
    updateStats({ energy: caredForSelf ? 4 : -7, safety: caredForSelf ? 5 : -3, support: askedHelp ? 7 : 0, connection: morning.includes("sister") ? 4 : 0 });
    setLog((old) => [...old, `十二歲的早晨選了：${morning.map((id) => morningTasks.find((x) => x.id === id)?.label).join("、")}`]);
    setFeedback({
      title: "你只能帶走三件事。",
      body: caredForSelf
        ? "你替自己留了一點位置。公車仍然差點錯過，但身體記得：你也算一個需要被照顧的人。"
        : "你讓每個人都勉強出門了，只有自己空著肚子。旁人只看到你又遲到，沒看到這個早晨有多少工作。",
      next: "path",
    });
  };

  const energyUsed = selectedTasks.reduce((sum, id) => sum + (dayTasks.find((task) => task.id === id)?.cost ?? 0), 0);
  const completeDay = () => {
    const delta: Delta = {};
    selectedTasks.forEach((id) => {
      const item = dayTasks.find((task) => task.id === id);
      if (!item) return;
      (Object.keys(item.delta) as (keyof Stats)[]).forEach((key) => { delta[key] = (delta[key] ?? 0) + (item.delta[key] ?? 0); });
    });
    if (!selectedTasks.includes("clinic")) delta.safety = (delta.safety ?? 0) - 5;
    updateStats(delta);
    setLog((old) => [...old, `二十六歲把有限能量用在：${selectedTasks.map((id) => dayTasks.find((x) => x.id === id)?.label).join("、")}`]);
    setFeedback({
      title: "晚上十點，清單還是沒有清空。",
      body: selectedTasks.includes("clinic")
        ? "回診花掉半天，你卻保住了接下來幾週的一點穩定。沒完成的家務不代表你失敗。"
        : "你完成了眼前的事情，回診通知仍留在手機裡。這不是不在乎健康；有時資源本身也需要能量才能抵達。",
      next: "work",
    });
  };

  const completeGroup = () => {
    const supportive = replies.filter((id) => groupReplies.find((item) => item.id === id)?.kind === "supportive").length;
    updateStats({ connection: supportive * 5, support: supportive * 7, energy: -2 });
    setLog((old) => [...old, "五十七歲，在群組裡選擇留下來陪一個人。"]) ;
    setFeedback({
      title: supportive === 2 ? "你沒有修好對方的人生。你陪他撐過了這十分鐘。" : "好意也可能讓人更孤單。",
      body: supportive === 2
        ? "支持往往不是漂亮答案，而是確認安全、連結現實中的人，並且不讓對方獨自等待專業協助。"
        : "『想開一點』聽起來積極，卻可能把困難推回對方身上。你還有機會學會另一種陪伴。",
      next: "plan",
    });
  };

  const finishLife = (item: string) => {
    setLegacy(item); setLog((old) => [...old, `八十二歲留下：${item}`]);
    window.localStorage.removeItem(SAVE_KEY); setHasSave(false); go("ending");
  };

  const sceneHeader = (kicker: string, title: string, intro: string) => (
    <header className="scene-heading">
      <p>{kicker}</p><h1>{title}</h1><div>{intro}</div>
    </header>
  );

  const feedbackCard = feedback && (
    <div className="feedback-card" role="status" aria-live="polite">
      <p>選擇之後</p><h3>{feedback.title}</h3><div>{feedback.body}</div>
      <button type="button" onClick={() => go(feedback.next)}>讓時間繼續 <span aria-hidden="true">→</span></button>
    </div>
  );

  if (step === "home") {
    return (
      <main className="site-shell home-shell">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">回</div>
          <p>一款關於看不見的日常、選擇與陪伴的生命 RPG</p>
          <a className="quiet-link" href="#about">關於作品</a>
        </header>
        <section className="hero" aria-labelledby="game-title">
          <div className="age-rail home-age-rail" aria-label="人生階段">
            <span className="active">00</span><i /><span>07</span><i /><span>17</span><i /><span>26</span><i /><span>45</span><i /><span>68</span><i /><span>終</span>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">你不會得到完美選項</p>
            <h1 id="game-title">一生的<br /><em>回聲</em></h1>
            <p className="lede">從還不懂「生病」是什麼的七歲開始，走過家裡沒說出口的秘密、校園裡的標籤、藥盒與打卡鐘，直到生命最後一個普通的下午。</p>
            <div className="actions">
              <button className="primary-button" type="button" onClick={newGame}>開始這一生 <span aria-hidden="true">→</span></button>
              {hasSave && <button className="resume-button" type="button" onClick={resumeGame}>繼續上次進度</button>}
            </div>
          </div>
          <div className="room-stage hero-room" aria-label="一間深夜仍亮著燈的客廳插畫">
            <div className="window"><span /><span /><span /></div><div className="lamp"><b /></div>
            <div className="sofa"><span /></div><div className="small-table"><i /><b /><em /></div>
            <div className="child"><span /><b /></div><p>02:13<br /><span>客廳</span></p>
          </div>
        </section>
        <section className="about-strip" id="about">
          <p>遊玩時間約 12–18 分鐘</p><p>沒有輸贏，只有不同代價</p>
          <p>由支持團體的共同生命經驗啟發；角色、對話與事件均已去識別化並重新編寫</p>
        </section>
      </main>
    );
  }

  return (
    <main className={`game-shell step-${step} ${softMode ? "soft-mode" : ""}`}>
      <header className="game-topbar">
        <button className="mini-brand" type="button" onClick={() => setPaused(true)} aria-label="開啟暫停與協助選單">回</button>
        <div><span>{currentAge ? `${currentAge} 歲` : "尾聲"}</span><b>一生的回聲</b></div>
        <button className="pause-button" type="button" onClick={() => setPaused(true)}>暫停／協助</button>
      </header>
      <AgeRail step={step} />

      {step === "notice" && (
        <section className="notice-screen centered-screen">
          <p className="chapter-kicker">開始以前</p><h1>這不是測驗。<br />也不是診斷。</h1>
          <div className="notice-grid">
            <article><b>01</b><h2>內容提醒</h2><p>故事包含家庭衝突、精神症狀、就醫、污名與生命危機，但不呈現傷害細節。</p></article>
            <article><b>02</b><h2>綜合生命</h2><p>主角不是任何一位真實成員，也不是所有精神疾病患者的代表。</p></article>
            <article><b>03</b><h2>隨時離開</h2><p>沒有倒數。右上角可隨時暫停、做安定練習或查看台灣即時資源。</p></article>
          </div>
          <label className="soft-toggle"><input type="checkbox" checked={softMode} onChange={(e) => setSoftMode(e.target.checked)} /><span />使用柔和敘事模式</label>
          <button className="primary-button" type="button" onClick={() => go("birth")}>我準備好了 <span aria-hidden="true">→</span></button>
        </section>
      )}

      {step === "birth" && (
        <section className="birth-screen centered-screen">
          <p className="chapter-kicker">序章 · 0 歲</p><h1>你出生了。<br /><em>沒有附說明書。</em></h1>
          <div className="birth-cards">
            <article><span>家庭氣候</span><strong>未知</strong><p>愛、壓力與沒有被說出口的往事，都已經在這裡。</p></article>
            <article><span>身體敏感度</span><strong>未知</strong><p>基因不是命運，但它會和環境一起寫下某些可能。</p></article>
            <article><span>可用資源</span><strong>未知</strong><p>住在哪裡、誰願意相信你，往後都可能改變道路。</p></article>
          </div>
          <p className="birth-note">你不能選擇起點。你能做的第一件事，只是呼吸。</p>
          <button className="primary-button" type="button" onClick={() => go("room")}>呼吸第一口氣 <span aria-hidden="true">→</span></button>
        </section>
      )}

      {step === "room" && (
        <section className="game-layout room-chapter">
          <div className="play-area">
            {sceneHeader("第一章 · 7 歲 · 凌晨 02:13", "客廳還亮著", "點擊三個發亮的物件。你還不認識病名，只能蒐集大人的線索。")}
            <div className="interactive-room room-stage">
              <div className="window"><span /><span /><span /></div><div className="lamp"><b /></div>
              <div className="sofa"><span /></div><div className="small-table"><i /><b /><em /></div><div className="child"><span /><b /></div>
              <button className={`clue clue-bag ${clues.includes("bag") ? "found" : ""}`} onClick={() => setClues((old) => old.includes("bag") ? old : [...old, "bag"])} aria-label="查看白色藥袋"><span>01</span></button>
              <button className={`clue clue-receipts ${clues.includes("receipts") ? "found" : ""}`} onClick={() => setClues((old) => old.includes("receipts") ? old : [...old, "receipts"])} aria-label="查看購物收據"><span>02</span></button>
              <button className={`clue clue-calendar ${clues.includes("calendar") ? "found" : ""}`} onClick={() => setClues((old) => old.includes("calendar") ? old : [...old, "calendar"])} aria-label="查看月曆"><span>03</span></button>
            </div>
          </div>
          <aside className="journal-panel">
            <p>你的觀察 <span>{clues.length}/3</span></p>
            {roomClues.map((item) => <article className={clues.includes(item.id) ? "revealed" : ""} key={item.id}><b>{clues.includes(item.id) ? item.label : "尚未發現"}</b><span>{clues.includes(item.id) ? item.text : "客廳裡還有什麼不尋常？"}</span></article>)}
            {clues.length === 3 && <button type="button" onClick={() => go("family")}>把線索放進記憶裡 <span>→</span></button>}
          </aside>
          <StatPanel stats={stats} />
        </section>
      )}

      {step === "family" && (
        <section className="game-layout dialogue-chapter">
          <div className="story-column">
            {sceneHeader("第一章 · 7 歲 · 隔天早上", "大人說：不要吵媽媽", "昨晚她說個不停；今天叫了三次都沒有醒。桌上的早餐是冷的。")}
            <div className="family-portrait"><div className="portrait parent" /><div className="portrait child-portrait" /><i /></div>
            <Dialogue speaker="爸爸">媽媽只是太累。你乖一點，去學校不要說家裡的事。</Dialogue>
            {!feedback && <div className="choice-list">
              <ChoiceButton title="問：昨晚的媽媽去哪裡了？" detail="你想知道，為什麼同一個人會像兩種天氣。" onClick={() => choose("七歲時問出家裡的秘密", { safety: -2, connection: 7 }, "爸爸沉默了很久。", "他最後只說『等你長大就懂』。你沒有得到答案，但知道自己的觀察是真的。", "school")} />
              <ChoiceButton title="把問題和沒吃完的早餐一起藏起來" detail="安靜，是你最早學會的保護色。" onClick={() => choose("七歲時學會保持安靜", { energy: -5, safety: 4, connection: -5 }, "家裡順利安靜下來。", "沒有人生氣，也沒有人發現你整天肚子痛。安全有時是用消失換來的。", "school")} />
              <ChoiceButton title="打電話給會聽你說話的阿姨" detail="你不確定這算不算背叛家裡。" onClick={() => choose("七歲時向家外求助", { support: 9, safety: 5, connection: -2 }, "阿姨沒有解釋病名。", "她只說：『這不是你的錯，也不是你一個小孩要處理的。』這句話先成為你的第一個資源。", "school")} />
            </div>}
            {feedbackCard}
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "school" && (
        <section className="game-layout school-chapter">
          <div className="story-column wide-story">
            {sceneHeader("第二章 · 12 歲 · 早上 07:27", "公車還有三分鐘", "家裡有六件急事，你只能完成三件。每一件都重要；點選三張卡片。")}
            <div className="school-clock">07:<strong>27</strong><span>下一班 08:02</span></div>
            <div className="task-grid morning-grid">
              {morningTasks.map((task) => {
                const picked = morning.includes(task.id);
                return <button type="button" className={picked ? "picked" : ""} key={task.id} onClick={() => setMorning((old) => picked ? old.filter((id) => id !== task.id) : old.length < 3 ? [...old, task.id] : old)}><span>{picked ? "已選" : "待辦"}</span><strong>{task.label}</strong><p>{task.note}</p></button>;
              })}
            </div>
            <div className="selection-footer"><p>你還能選 <strong>{3 - morning.length}</strong> 件</p><button type="button" disabled={morning.length !== 3 || Boolean(feedback)} onClick={completeMorning}>讓早晨往前走 →</button></div>
            {feedbackCard}
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "path" && (
        <section className="game-layout path-chapter">
          <div className="story-column wide-story">
            {sceneHeader("第三章 · 17 歲", "身體開始用不同方式說話", "選擇這一輪想體驗的路線。這不是自我診斷；每一種疾病內部也有很大的個別差異。")}
            <div className="path-grid">
              {(Object.keys(pathInfo) as PathKey[]).map((key, index) => <button type="button" key={key} onClick={() => { setPath(key); setLog((old) => [...old, `選擇體驗：${pathInfo[key].label}`]); go("clinic"); }}><span>0{index + 1}</span><h2>{pathInfo[key].label}</h2><p>{pathInfo[key].short}</p><i>進入這條路線 →</i></button>)}
            </div>
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "clinic" && path && (
        <section className={`game-layout dialogue-chapter lens-${path}`}>
          <div className="story-column">
            {sceneHeader("第三章 · 17 歲 · 第一次身心科門診後", "現在，它有了一個名字", pathInfo[path].lens)}
            <div className="clinic-ticket"><span>身心科門診</span><b>第 071 號</b><i>下一位</i></div>
            <Dialogue speaker="媽媽 · 看見你手上的藥袋">你七歲那年看到的白色藥袋，也是我的。那時候我不知道怎麼說，只想讓你以為家裡沒事。</Dialogue>
            <Dialogue speaker="媽媽" thought="原來妳也早就知道這種害怕。">可是醫生是不是想太多？大家壓力大都會這樣。先不要讓學校知道。</Dialogue>
            {!feedback && <div className="choice-list">
              <ChoiceButton title="把醫生畫的症狀圖推到她面前" detail="你想要她第一次看見，不只看見診斷名稱。" onClick={() => choose("十七歲向家人完整說明", { energy: -6, connection: 10, safety: 3 }, "她看了很久。", "她沒有立刻理解，只問你下次回診要不要陪。理解不是一句話發生的，但門開了一條縫。", "day")} />
              <ChoiceButton title="只說：我需要規律回診和睡覺" detail="先談需求，不交出所有隱私。" onClick={() => choose("十七歲只說明自己的需要", { energy: -2, safety: 8, connection: 3 }, "你保留了自己的界線。", "不完整揭露並不等於說謊。你先替生活爭取一小塊可以呼吸的地方。", "day")} />
              <ChoiceButton title="說醫生也覺得沒什麼" detail="你決定先讓家裡平靜。" onClick={() => choose("十七歲隱藏診斷", { safety: 2, support: -5, connection: -4 }, "媽媽鬆了一口氣。", "你也笑了一下。晚上，藥袋被塞進書包最底層；需要幫忙時，你得先跨過自己築起的牆。", "day")} />
            </div>}
            {feedbackCard}
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "day" && (
        <section className="game-layout day-chapter">
          <div className="story-column wide-story">
            {sceneHeader("第四章 · 26 歲 · 星期三", "今天需要 14 格能量", "你醒來只有 7 格。這不是時間管理題；有些日子，洗澡和回一則訊息本身就是任務。")}
            <div className="energy-budget"><span>今日可用</span><b>{7 - energyUsed}</b><i>/ 7 格能量</i><div><em style={{ width: `${Math.max(0, (7 - energyUsed) / 7 * 100)}%` }} /></div></div>
            <div className="task-grid day-grid">
              {dayTasks.map((task) => {
                const picked = selectedTasks.includes(task.id); const available = picked || energyUsed + task.cost <= 7;
                return <button type="button" key={task.id} className={picked ? "picked" : ""} disabled={!available || Boolean(feedback)} onClick={() => setSelectedTasks((old) => picked ? old.filter((id) => id !== task.id) : [...old, task.id])}><span>{task.cost} 格</span><strong>{task.label}</strong><i>{picked ? "放回能量" : available ? "加入今天" : "能量不足"}</i></button>;
              })}
            </div>
            <div className="selection-footer"><p>所有任務都合理，總和卻超過你今天擁有的。</p><button type="button" disabled={selectedTasks.length < 2 || Boolean(feedback)} onClick={completeDay}>結束這一天 →</button></div>
            {feedbackCard}
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "work" && (
        <section className="game-layout dialogue-chapter work-chapter">
          <div className="story-column">
            {sceneHeader("第五章 · 33 歲 · 主管面談", "能不能保證以後不請假？", "你已經連續工作八個月。主管說很肯定你，只是最近回診和身體不適讓出勤表不好看。")}
            <div className="office-scene"><div className="desk" /><span className="worker-a" /><span className="worker-b" /><i>出勤紀錄</i></div>
            <Dialogue speaker="主管">公司願意幫忙，但我需要知道，你到底生了什麼病？</Dialogue>
            {!feedback && <div className="choice-list">
              <ChoiceButton title="說出完整診斷" detail="可能換來理解，也可能讓別人從此只看見病名。" onClick={() => choose("三十三歲在職場完整揭露", { energy: -5, safety: -3, connection: 8 }, "主管謝謝你的誠實。", "他答應排班前先詢問你，卻也把一項重要工作交給別人。支持與偏見，有時會出現在同一句話裡。", "care")} />
              <ChoiceButton title="只說明需要的調整" detail="固定回診時段、書面工作指令，以及提早告知排班。" onClick={() => choose("三十三歲提出具體職務需求", { safety: 10, support: 5, energy: -2 }, "你談的是工作，不是交代整個人生。", "主管沒有完全明白症狀，但同意先試三個月。合理調整讓能力有機會被看見。", "care")} />
              <ChoiceButton title="說是普通身體不適" detail="保住隱私，也繼續獨自處理每次波動。" onClick={() => choose("三十三歲保留職場隱私", { safety: 3, energy: -7, connection: -4 }, "面談很快結束。", "你暫時避開被貼標籤的風險。下次回診，你仍得在工作、收入與健康之間自己挪位置。", "care")} />
            </div>}
            {feedbackCard}
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "care" && (
        <section className="game-layout dialogue-chapter care-chapter">
          <div className="story-column">
            {sceneHeader("第六章 · 45 歲 · 兩張掛號單", "你也是病人，也是照顧者", "媽媽明早要做檢查；你的精神科回診在同一時間。她以前接送過你很多次，現在輪到你拿著她的健保卡。")}
            <div className="ticket-pair"><article><span>08:40</span><b>媽媽 · 神經科</b></article><i>同時</i><article><span>09:10</span><b>你 · 身心科</b></article></div>
            <Dialogue speaker="媽媽">我的可以再約。你不要因為我又不舒服。</Dialogue>
            {!feedback && <div className="choice-list">
              <ChoiceButton title="取消自己的回診，先陪媽媽" detail="愛有時很自然，也可能讓照顧者慢慢消失。" onClick={() => choose("四十五歲先照顧家人", { connection: 9, safety: -9, energy: -6 }, "你陪她完成檢查。", "她一路握著你的手。晚上，你發現自己的藥只剩兩天；照顧別人與犧牲自己並不是同一件事，卻常被排在一起。", "group")} />
              <ChoiceButton title="問手足，也詢問醫院交通與陪診資源" detail="把照顧從一個人的責任，改成一張網。" onClick={() => choose("四十五歲把照顧變成共同任務", { support: 12, safety: 7, connection: 4, energy: -3 }, "你打了很多通電話。", "手足先抱怨，最後仍排開半天。求助沒有讓事情變輕鬆，卻讓你們兩個人的回診都沒有消失。", "group")} />
              <ChoiceButton title="堅持自己的回診，請媽媽改期" detail="界線可能帶來內疚，也能保住你長期照顧的能力。" onClick={() => choose("四十五歲守住自己的醫療", { safety: 11, connection: -4, energy: -2 }, "媽媽說她知道。", "你仍一路內疚到診間。醫師提醒：能持續照顧的人，也需要先是一個活得下去的人。", "group")} />
            </div>}
            {feedbackCard}
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "group" && (
        <section className="game-layout group-chapter">
          <div className="story-column wide-story">
            {sceneHeader("第七章 · 57 歲 · 晚上 23:48", "群組裡有人說：我撐不住了", softMode ? "那是一句很沉的訊息。請選兩句你想傳出的回覆。" : "訊息提到不想繼續活下去。請選兩句你想傳出的回覆；支持也需要確認現實中的安全。")}
            <div className="phone-chat"><p>23:48</p><div className="incoming">今天真的撐不住。<br />手機也快沒電了。</div><span>已讀 7</span></div>
            <div className="reply-grid">
              {groupReplies.map((reply) => { const picked = replies.includes(reply.id); return <button type="button" className={picked ? "picked" : ""} disabled={(!picked && replies.length >= 2) || Boolean(feedback)} key={reply.id} onClick={() => setReplies((old) => picked ? old.filter((id) => id !== reply.id) : [...old, reply.id])}><span>{picked ? "已選" : "回覆"}</span><p>{reply.text}</p></button>; })}
            </div>
            <div className="selection-footer"><p>你不必當治療者，但可以成為通往安全的橋。</p><button type="button" disabled={replies.length !== 2 || Boolean(feedback)} onClick={completeGroup}>送出兩則訊息 →</button></div>
            {feedbackCard}
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "plan" && (
        <section className="game-layout plan-chapter">
          <div className="story-column wide-story">
            {sceneHeader("第八章 · 68 歲", "把危機計畫寫在平靜的時候", "逐欄選一項，完成一張能交給家人、朋友或專業人員看的支持卡。")}
            <div className="plan-builder">
              {planGroups.map((group, index) => <fieldset key={group.id}><legend><span>0{index + 1}</span>{group.label}</legend>{group.options.map((option) => <label className={plan[group.id] === option ? "picked" : ""} key={option}><input type="radio" name={group.id} checked={plan[group.id] === option} onChange={() => setPlan((old) => ({ ...old, [group.id]: option }))} />{option}</label>)}</fieldset>)}
            </div>
            {Object.keys(plan).length === planGroups.length && <div className="support-card"><p>我的支持卡</p><ol>{planGroups.map((group) => <li key={group.id}><span>{group.label}</span><b>{plan[group.id]}</b></li>)}</ol><button type="button" onClick={() => { updateStats({ safety: 12, support: 10 }); setLog((old) => [...old, "六十八歲，事先寫下自己的支持方式。"]); go("legacy"); }}>把卡片交給信任的人 →</button></div>}
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "legacy" && (
        <section className="game-layout legacy-chapter">
          <div className="story-column wide-story">
            {sceneHeader("終章 · 82 歲 · 一個普通的下午", "你要留下哪一件小事？", "人生沒有被疾病全部占滿。最後留下來的，也許不是診斷或病歷，而是一件微小、反覆陪你活著的東西。")}
            <div className="legacy-grid">
              <button onClick={() => finishLife("群組裡每天有人說的那句晚安")}><span className="legacy-chat">晚安</span><b>一則群組訊息</b><p>有人不一定認識你的臉，卻記得你今天有沒有出現。</p></button>
              <button onClick={() => finishLife("用了很多年的七格藥盒")}><span className="legacy-pills"><i /><i /><i /><i /><i /><i /><i /></span><b>一只舊藥盒</b><p>它不是順從的證明，是你一次次調整、詢問與選擇的痕跡。</p></button>
              <button onClick={() => finishLife("窗邊重新長出新葉的植物")}><span className="legacy-plant"><i /></span><b>一盆植物</b><p>有時只澆了一點水，也還是活過了一個季節。</p></button>
              <button onClick={() => finishLife("陪家人與自己跑過無數次醫院的車票")}><span className="legacy-ticket">往返</span><b>一張舊車票</b><p>去醫院的路很長，回家的路也一樣是真實生活。</p></button>
            </div>
          </div><StatPanel stats={stats} />
        </section>
      )}

      {step === "ending" && path && (
        <section className="ending-screen">
          <div className="ending-copy">
            <p className="chapter-kicker">終章 · 82 歲</p><h1>你活過的，<br />不只是一種病。</h1>
            <p>某個清晨，你在睡夢中離開。桌上留下了<strong>{legacy}</strong>。這不是勝利，也不是失敗；是一段曾經需要很多力氣、也有很多普通時刻的人生。</p>
          </div>
          <div className="ending-summary">
            <span>你體驗的生命路線</span><h2>{pathInfo[path].label}</h2><p>{pathInfo[path].detail}</p>
            <div className="final-stats"><div><b>{stats.connection}</b><span>連結</span></div><div><b>{stats.support}</b><span>支持網</span></div><div><b>{stats.safety}</b><span>安全感</span></div></div>
            <p className="no-score">數字沒有判定死亡方式，也沒有產生好壞結局。它只記錄：一個人必須用多少選擇，才能把日常繼續下去。</p>
          </div>
          <div className="debrief">
            <article><span>回看這一生</span><h3>困難不只來自症狀</h3><p>家庭沉默、求職壓力、交通、費用、污名與照顧責任，都會放大疾病帶來的不便。</p></article>
            <article><span>回看資源</span><h3>支持不是替人決定</h3><p>真正有用的支持包括相信感受、詢問需要、提供選擇、協助連結專業，以及尊重當事人的自主。</p></article>
            <article><span>回看病友</span><h3>他們也在照顧別人</h3><p>病友不只是被幫助的人，也可能是子女、父母、工作者、照顧者，以及深夜願意回覆別人的同伴。</p></article>
          </div>
          <div className="resource-bar">
            <div><b>如果故事讓你不舒服</b><span>先離開畫面、喝水，找一位可信任的人。台灣可撥24小時免付費安心專線。</span></div>
            <a href="tel:1925">1925 安心專線</a><a href="https://dep.mohw.gov.tw/DOMHAOH/cp-6435-70356-107.html" target="_blank" rel="noreferrer">社區心理衛生中心</a>
          </div>
          <footer><p>本作由支持團體的共同經驗啟發，所有角色與事件皆為融合、去識別化的虛構創作，不用於自我診斷。</p><button type="button" onClick={newGame}>走另一條人生路線</button></footer>
        </section>
      )}

      {paused && (
        <div className="pause-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <div className="pause-card"><p>先停在這裡</p><h2 id="pause-title">你不需要把故事一次走完。</h2><div className="grounding"><b>30 秒回到現在</b><span>雙腳踩地。看見 5 樣東西、觸碰 4 樣東西、聽見 3 種聲音，慢慢吐一口氣。</span></div><div className="pause-resources"><a href="tel:1925"><b>1925</b><span>24小時安心專線</span></a><a href="tel:119"><b>119</b><span>有立即危險時</span></a></div><button className="primary-button" onClick={() => setPaused(false)}>回到遊戲</button><button className="exit-button" onClick={() => { setPaused(false); setStep("home"); }}>先離開，保留進度</button></div>
        </div>
      )}
    </main>
  );
}
