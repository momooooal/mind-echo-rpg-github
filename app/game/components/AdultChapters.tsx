"use client";

import type { Dispatch } from "react";
import { DialogueBox } from "./DialogueBox";
import {
  ADULT_CLINIC_TIMELINE,
  AGING_OBJECTS,
  CARE_OPTIONS,
  FINAL_DAY_ACTIONS,
  FIRST_WORK_TASKS,
  GROUP_MESSAGES,
  GROUP_REPLY_OPTIONS,
  MASKING_MOMENTS,
  MOVE_ITEMS,
  SYSTEM_DUNGEON_TASKS,
} from "../data/adultEvents";
import { createLifeStatistics } from "../engine/lifeStats";
import type { GameAction, GameState, Phase } from "../types";

type Props = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  go: (phase: Phase, age?: number, text?: string) => void;
  openMemory: () => void;
  newLife: () => void;
};

function Heading({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return <header className="scene-heading"><p>{kicker}</p><h1>{title}</h1><div>{children}</div></header>;
}

function actionIds(state: GameState, prefix: string) {
  return state.adultActions.filter((id) => id.startsWith(prefix));
}

function Consequence({ label, text }: { label: string; text: string }) {
  return <div className="consequence-dialogue"><span>{label}</span><p>{text}</p></div>;
}

export function AdultChapters({ state, dispatch, go, openMemory, newLife }: Props) {
  if (state.phase === "slice-ending") {
    return <div className="adult-bridge"><span className="tape-label">18 歲 · 存檔已接續</span><h1>你沒有在這裡結束。</h1><p>童年的秘密、第一次求助與說不出口的習慣，都會跟著你搬進下一個房間。</p><button type="button" className="main-action" onClick={() => go("moving-out", 21)}>三年後，開始打包</button></div>;
  }

  if (state.phase === "moving-out") {
    const packed = actionIds(state, "move-").map((id) => id.replace("move-", ""));
    const full = packed.length >= 5;
    return <><Heading kicker="第七章 · 21 歲 · 租屋處交屋前" title="兩個紙箱，裝不下整個家">你第一次離家。房間只能放下一張床、一張桌子和五樣你願意自己帶走的東西。</Heading><div className="moving-scene"><div className="cardboard-box"><b>{packed.length}/5</b><span>紙箱</span></div><div className="move-items">{MOVE_ITEMS.map((item) => <button type="button" key={item.id} disabled={packed.includes(item.id) || full} className={packed.includes(item.id) ? "packed" : ""} onClick={() => dispatch({ type: "ADULT_ACTION", actionId: `move-${item.id}`, counters: item.id === "plant" ? { plantsKeptAlive: 1 } : undefined, text: item.note })}><span>{packed.includes(item.id) ? "已裝箱" : "帶走？"}</span><b>{item.label}</b><p>{item.note}</p></button>)}</div></div>{packed.length > 0 && <div className="action-caption"><span>房間</span><p>{state.lastText}</p></div>}{full && <><Consequence label="17:06 · 新房間" text={packed.includes("charger") ? "你坐在還沒鋪床單的地板上。手機有電、鑰匙在手上。這裡很小，但沉默暫時只屬於你。" : "第一晚，手機剩 6%。你坐在地板上，第一次發現安靜也可以不是警告。"} /><button type="button" className="main-action next-scene" onClick={() => { dispatch({ type: "UNLOCK_MEMORY", memoryId: "first-rent-key" }); dispatch({ type: "APPLY_CHOICE", effects: { familyStress: -7, financialStress: 9 }, flags: ["leftHome"], text: "第一把自己的鑰匙放進口袋。", next: "first-work", age: 23 }); }}>兩年後，第一份工作</button></>}</>;
  }

  if (state.phase === "first-work") {
    const interviewDone = state.flags.firstInterviewDone;
    const doneTasks = actionIds(state, "workday-").length;
    const currentTask = FIRST_WORK_TASKS[doneTasks];
    const workdayDone = doneTasks >= FIRST_WORK_TASKS.length;
    return <><Heading kicker="第八章 · 23 歲 · 第一份全職工作" title="抗壓性好嗎？">履歷沒有寫診斷。面試官也不是壞人；他只是用一句所有人都會問的話，把很多生活壓成一個答案。</Heading>{!interviewDone ? <DialogueBox speaker="面試主管" text="這份工作節奏很快。你覺得自己的抗壓性好嗎？" thought="我可以把工作做完，但有時候只是來到公司就已經用掉很多力氣。" choices={[{ id: "great", label: "很好，沒問題。" }, { id: "method", label: "我會把不清楚的工作拆開確認。" }, { id: "haha", label: "哈哈，看情況。" }]} onChoose={(id) => dispatch({ type: "APPLY_CHOICE", flags: ["firstInterviewDone", ...(id === "great" ? ["maskedAtInterview"] : [])], effects: id === "great" ? { masking: 5 } : { selfBlame: -2 }, counters: id === "great" ? { pretendedOkay: 1 } : undefined, text: id === "great" ? "主管在表格上打了一個勾。你得到工作，也得到一句之後要努力維持的答案。" : "主管點點頭，接著問你什麼時候可以上班。" })} /> : !workdayDone ? <div className="first-workday"><div className="workplace-map"><span className="desk-a">A 桌</span><span className="desk-b">B 桌</span><span className="clock-in">08:27</span><div className="office-avatar" /></div><article><span>今天</span><h2>{currentTask.label}</h2><p>{currentTask.note}</p><button type="button" className="main-action" onClick={() => dispatch({ type: "ADULT_ACTION", actionId: `workday-${currentTask.id}`, counters: currentTask.id === "shift" ? { workedWhileExhausted: 1 } : currentTask.id === "lunch" ? { goodFood: 1 } : undefined, text: currentTask.note })}>去做</button></article></div> : <><Consequence label="18:14 · 下班" text="你把第一個班做完了，還幫同事發現一個資料錯誤。同事問要不要一起吃滷味。你很累，也真的有點想去。" /><div className="plain-choices"><button type="button" disabled={actionIds(state, "first-job-").length > 0} onClick={() => dispatch({ type: "ADULT_ACTION", actionId: "first-job-dinner", flags: ["madeWorkFriend"], counters: { goodFood: 1, laughedHard: 1 }, text: "你去了。大家只是在抱怨星期一，沒有人問你的人生故事。" })}>去吃一小時。</button><button type="button" disabled={actionIds(state, "first-job-").length > 0} onClick={() => dispatch({ type: "ADULT_ACTION", actionId: "first-job-home", counters: { cancelledPlans: 1 }, text: "你說下次。回家後在玄關坐了二十分鐘才脫鞋。" })}>說下次，直接回家。</button></div>{actionIds(state, "first-job-").length > 0 && <><p className="speed-caption">{state.lastText}</p><button type="button" className="main-action next-scene" onClick={() => go("relationship", 28)}>五年後，有一個很在意的人</button></>}</>}</>;
  }

  if (state.phase === "relationship") {
    const done = state.flags.relationshipTalkDone;
    const outcome = state.flags.relationshipOpen
      ? "阿沐過了十二分鐘才回：『謝謝你說。我今天也有點累，不一定知道怎麼幫，但我可以先知道。』"
      : state.flags.relationshipDeleted
        ? "阿沐回：『好，那你先休息。』他沒有收到你刪掉的那一大段。"
        : state.flags.relationshipClosed
          ? "螢幕暗下去。隔天阿沐說：『我以為你不想理我。』"
          : "阿沐回了一張抱枕貼圖：『可是你看起來一直都很好啊？』";
    return <><Heading kicker="第九章 · 28 歲 · 23:36" title="我其實最近……">你已經臨時取消兩次約會。阿沐問是不是自己做錯什麼。游標停在一段還沒送出的話後面。</Heading><div className="relationship-phone"><header><span>阿沐</span><small>剛剛在線</small></header><div className="chat-bubble incoming">如果你不想見我可以直接說。<br />我只是想知道是不是我做錯什麼。</div><div className={`message-draft ${state.flags.familySecrecy ? "secrecy-flicker" : ""}`}><span>你想傳</span><p>不是你。我最近有時候連出門前洗澡都要準備很久，我怕你覺得我很麻煩，而且我不知道怎麼講……</p></div></div>{!done ? <div className="message-actions"><button type="button" onClick={() => dispatch({ type: "APPLY_CHOICE", flags: ["relationshipTalkDone", "relationshipOpen"], effects: { masking: -7, socialSupport: 10 }, counters: { saidNotOkay: 1, peopleBelieved: 1 }, text: "你把那一大段送出去。送出後立刻想收回。" })}>送出去。</button><button type="button" onClick={() => { dispatch({ type: "UNLOCK_MEMORY", memoryId: "deleted-love-message" }); dispatch({ type: "APPLY_CHOICE", flags: ["relationshipTalkDone", "relationshipDeleted"], effects: { masking: 6 }, counters: { deletedMessages: 1, pretendedOkay: 1 }, text: "你全選、刪除，最後傳：哈哈沒事啦，最近比較忙。" }); }}>刪除，改傳「哈哈沒事啦」。</button><button type="button" onClick={() => dispatch({ type: "APPLY_CHOICE", flags: ["relationshipTalkDone", "relationshipClosed"], effects: { masking: 4 }, counters: { cancelledPlans: 1 }, text: "你把手機翻過去。訊息沒有消失。" })}>關掉手機。</button><button type="button" onClick={() => dispatch({ type: "APPLY_CHOICE", flags: ["relationshipTalkDone", "relationshipPartial"], effects: { socialSupport: 3 }, text: "你傳：不是你，我今天真的很累。這是目前能送出的版本。" })}>只說：不是你，我今天很累。</button></div> : <><Consequence label="00:02" text={outcome} /><button type="button" className="main-action next-scene" onClick={() => go("masking-work", 32)}>四年後，星期一早上</button></>}</>;
  }

  if (state.phase === "masking-work") {
    const finished = MASKING_MOMENTS.filter((moment) => actionIds(state, `mask-${moment.id}-`).length > 0).length;
    const moment = MASKING_MOMENTS[finished];
    if (finished >= MASKING_MOMENTS.length) {
      return <><Heading kicker="第十章 · 32 歲 · 18:23" title="普通表情維持了一整天">工作有完成，沒有人追問。阿沐晚上看著你說：「可是你今天明明很不好。」</Heading><Consequence label="短期看起來一切正常" text={state.lastText} /><button type="button" className="main-action next-scene" onClick={() => { dispatch({ type: "UNLOCK_MEMORY", memoryId: "company-lanyard" }); go("adult-clinic", 34); }}>下一次回診日</button></>;
    }
    return <><Heading kicker={`第十章 · 32 歲 · 工作日 ${finished + 1}/3`} title="【假裝沒事】隨時可以用">它很有用：保護隱私、阻止追問、讓會議繼續。它也不是免費的。</Heading><DialogueBox speaker={moment.who} text={moment.line} thought={moment.thought} choices={[{ id: "mask", label: finished === 0 ? "哈哈昨天追劇啦。" : "沒問題，我可以。" }, { id: "boundary", label: "我需要十分鐘整理，再回來。" }, { id: "smalltruth", label: "今天狀態不太好，但工作我會交代清楚。" }]} onChoose={(id) => dispatch({ type: "ADULT_ACTION", actionId: `mask-${moment.id}-${id}`, effects: id === "mask" ? { masking: 7, sleepDebt: 3 } : id === "boundary" ? { professionalSupport: 2, selfBlame: -2 } : { socialSupport: 2, masking: -2 }, counters: id === "mask" ? { maskedAtWork: 1, pretendedOkay: 1, workedWhileExhausted: 1 } : id === "smalltruth" ? { saidNotOkay: 1 } : undefined, text: id === "mask" ? "對方笑了一下，話題順利結束。你把剩下的力氣拿去維持剛才那個版本。" : id === "boundary" ? "同事說好。十分鐘沒有讓世界停下，但讓字重新待在原位。" : "同事沒有變成治療者，只把截止時間再確認一次。" })} /></>;
  }

  if (state.phase === "adult-clinic") {
    const leaveDone = state.flags.adultLeaveDone;
    const complete = state.chapterProgress >= ADULT_CLINIC_TIMELINE.length;
    const current = ADULT_CLINIC_TIMELINE[Math.min(state.chapterProgress, ADULT_CLINIC_TIMELINE.length - 1)];
    return <><Heading kicker="第十一章 · 34 歲 · 回診副本" title="九分鐘的診間，半天的生活成本">回診不是按一個按鈕。你要先替它在工作、交通、午餐和精力裡挖出一個洞。</Heading>{!leaveDone ? <DialogueBox speaker="主管 · 通訊軟體" text="明天上午可以到嗎？這週比較忙。" thought="藥剩三天。門診只有白天。其實我不是在問能不能去，是在問要怎麼付這個代價。" choices={[{ id: "annual", label: "我請半天特休。" }, { id: "medical", label: "我有固定醫療安排。" }, { id: "vague", label: "家裡有事。" }]} onChoose={(id) => dispatch({ type: "APPLY_CHOICE", flags: ["adultLeaveDone", ...(id === "medical" ? ["statedMedicalNeed"] : [])], effects: id === "vague" ? { masking: 3 } : { professionalSupport: 2 }, text: id === "annual" ? "主管核准。你的休假餘額少了半天。" : id === "medical" ? "主管停了幾分鐘，回：『收到，下午到就好。』" : "主管回：『好，處理完再來。』你暫時不用解釋。" })} /> : !complete ? <><div className="adult-clinic-clock"><b>{current.time}</b><span>{current.label}</span><p>{current.note}</p></div><div className="clinic-timeline compact">{ADULT_CLINIC_TIMELINE.map((item, index) => <article key={item.time} className={index < state.chapterProgress ? "past" : index === state.chapterProgress ? "now" : "future"}><time>{item.time}</time><div><b>{item.label}</b><p>{index <= state.chapterProgress ? item.note : ""}</p></div></article>)}</div><button type="button" className="main-action" onClick={() => dispatch({ type: "ADVANCE_PROGRESS", text: current.note })}>{state.chapterProgress === 4 ? "再等七個號碼" : "繼續這個上午"}</button></> : !state.flags.adultClinicDone ? <div className="treatment-talk"><Consequence label="回公司以前" text="這次你把白天嗜睡、食慾和工作影響都帶進診間。醫師沒有把副作用當成『忍一下就好』，也沒有叫你自行停藥。" /><div className="plain-choices"><button type="button" onClick={() => { dispatch({ type: "UNLOCK_MEMORY", memoryId: "adult-clinic-ticket" }); dispatch({ type: "APPLY_CHOICE", flags: ["adultClinicDone"], effects: { professionalSupport: 6 }, counters: { onTimeAppointments: 1, hospitalTrips: 1 }, text: "你們約好記錄生活影響，再一起調整治療方向。沒有一個選項只帶來好處。" }); }}>把生活影響寫進下次追蹤。</button><button type="button" onClick={() => { dispatch({ type: "UNLOCK_MEMORY", memoryId: "adult-clinic-ticket" }); dispatch({ type: "APPLY_CHOICE", flags: ["adultClinicDone"], effects: { masking: 2 }, counters: { onTimeAppointments: 1, hospitalTrips: 1 }, text: "你還是漏問了一件事。回程捷運上才想起來，先記在手機裡。" }); }}>先離開，回程才想起漏問的事。</button></div></div> : <><Consequence label="13:42 · 公司茶水間" text={state.lastText} /><DialogueBox speaker="同事" text="休假去哪玩？" thought="公車、捷運、掛號、候診、九分鐘、領藥、沒有午餐。" choices={[{ id: "errand", label: "跑事情啦。" }, { id: "hospital", label: "去醫院回診。" }, { id: "haha", label: "哈哈秘密。" }]} onChoose={(id) => dispatch({ type: "APPLY_CHOICE", flags: ["clinicSmallTalkDone"], counters: id === "hospital" ? { saidNotOkay: 1 } : { pretendedOkay: 1 }, text: id === "hospital" ? "同事說：『喔，辛苦了。咖啡還有。』話題就這樣過去。" : "同事接受答案，把餅乾往你這邊推。" })} />{state.flags.clinicSmallTalkDone && <button type="button" className="main-action next-scene" onClick={() => go("work-disclosure", 35)}>幾個月後，主管面談</button>}</>}</>;
  }

  if (state.phase === "work-disclosure") {
    const disclosed = state.flags.disclosureFull || state.flags.disclosureNeeds || state.flags.disclosurePrivate;
    const delayed = state.flags.disclosureConsequence;
    const result = state.flags.disclosureFull
      ? "原本由你主責的專案從行事曆消失了。主管說：『我是想說你最近比較需要休息。』他可能真的以為這是幫忙。"
      : state.flags.disclosureNeeds
        ? "回診時段固定下來，工作指令也改成書面。主管偶爾仍問『真的沒問題嗎』，但專案還在你手上。"
        : "沒有人知道診斷。排班照舊，隱私保住了；每次回診仍要重新發明一個理由。";
    return <><Heading kicker="第十二章 · 35 歲 · 主管面談" title="公司願意幫忙，但需要知道嗎？">你這季的工作評價很好。主管先肯定你的能力，才問最近固定請假的原因。</Heading>{!disclosed ? <DialogueBox speaker="主管" text="如果是健康問題，公司願意幫忙。你方便說是什麼診斷嗎？" thought="完整說明可能換來理解，也可能讓病名走在我前面。" choices={[{ id: "full", label: "說出完整診斷。" }, { id: "needs", label: "只說固定回診與需要的工作調整。" }, { id: "private", label: "這是私人醫療安排，工作交付不變。" }]} onChoose={(id) => dispatch({ type: "APPLY_CHOICE", flags: [id === "full" ? "disclosureFull" : id === "needs" ? "disclosureNeeds" : "disclosurePrivate"], effects: id === "full" ? { stigmaExposure: 8, masking: -5 } : id === "needs" ? { professionalSupport: 6 } : { masking: 3 }, counters: id === "full" ? { saidNotOkay: 1 } : undefined, text: id === "full" ? "主管說：『謝謝你信任公司。有需要我們都可以幫忙。』" : id === "needs" ? "主管問了兩個工作安排問題，沒有追問病名。" : "主管點頭：『好，只要進度有交代就好。』" })} /> : !delayed ? <><Consequence label="面談結束" text={state.lastText} /><button type="button" className="main-action next-scene" onClick={() => { dispatch({ type: "UNLOCK_MEMORY", memoryId: state.flags.disclosureFull ? "missing-project" : "company-lanyard" }); dispatch({ type: "APPLY_CHOICE", flags: ["disclosureConsequence"], counters: state.flags.disclosureFull ? { maskedAtWork: 1 } : undefined, text: result }); }}>兩個月後</button></> : <><Consequence label="兩個月後 · 沒有人宣布這是後果" text={result} /><button type="button" className="main-action next-scene" onClick={() => go("career-project", 41)}>六年後，另一個重要專案</button></>}</>;
  }

  if (state.phase === "career-project") {
    const tasks = [
      ["scope", "把混亂需求整理成三個問題", "會議終於知道在吵什麼。"],
      ["plan", "拆出可交付的時程", "你替團隊留了真的能休息的緩衝。"],
      ["review", "發現資料裡的錯誤", "這是你擅長的事，不是『雖然生病還是做到』。"],
      ["deliver", "完成提案", "客戶說清楚、好用，問下次能不能再合作。"],
    ] as const;
    const done = actionIds(state, "career-").length;
    const current = tasks[Math.min(done, tasks.length - 1)];
    return <><Heading kicker="第十三章 · 41 歲 · 專案週" title="你真的很會做這件事">精神疾病沒有把能力取消。今天的麻煩是需求亂、會議多、星期一很討厭——普通工作的普通麻煩。</Heading><div className="career-board">{tasks.map(([id, label, note], index) => <article key={id} className={index < done ? "done" : index === done ? "now" : "future"}><span>{String(index + 1).padStart(2, "0")}</span><h2>{label}</h2><p>{index <= done ? note : ""}</p></article>)}</div>{done < tasks.length ? <button type="button" className="main-action" onClick={() => dispatch({ type: "ADULT_ACTION", actionId: `career-${current[0]}`, counters: current[0] === "deliver" ? { projectsCompleted: 1 } : undefined, text: current[2] })}>處理下一件事</button> : <><Consequence label="週五 · 17:52" text="專案完成。團隊在茶水間分掉一盒很普通的蛋糕。你抱怨奶油太甜，還是吃了第二塊。" /><button type="button" className="main-action next-scene" onClick={() => { dispatch({ type: "ADULT_ACTION", actionId: "career-celebrate", counters: { laughedHard: 1, goodFood: 1 }, text: "工作做得很好，這件事本身就成立。" }); go("caregiving", 45); }}>四年後，兩張掛號單</button></>}</>;
  }

  if (state.phase === "caregiving") {
    const chosen = CARE_OPTIONS.find((option) => state.flags[`care-${option.id}`]);
    const result = chosen?.id === "cancel-self"
      ? "你陪家人完成檢查。晚上回家才發現自己的藥剩兩天，下一個門診要再等三週。"
      : chosen?.id === "network"
        ? "你打了六通電話。手足先抱怨，最後排開半天；醫院交通也確認了。兩張掛號單都沒有消失。"
        : "家人改到下週。你一路內疚到自己的診間，回家時對方問：醫生怎麼說？";
    return <><Heading kicker="第十四章 · 45 歲 · 兩張掛號單" title="你也是病人，也是照顧者">家人明早要做檢查；你的精神科回診在同一個上午。愛、責任和可用時間不是同一件事。</Heading><div className="ticket-conflict"><article><time>08:40</time><b>家人 · 神經科</b><span>需要陪同</span></article><i>同一天</i><article><time>09:10</time><b>你 · 身心科</b><span>藥剩三天</span></article></div>{!chosen ? <div className="care-options">{CARE_OPTIONS.map((option) => <button type="button" key={option.id} onClick={() => { dispatch({ type: "UNLOCK_MEMORY", memoryId: "two-appointments" }); dispatch({ type: "APPLY_CHOICE", flags: [`care-${option.id}`], effects: option.id === "cancel-self" ? { professionalSupport: -6, selfBlame: 3 } : option.id === "network" ? { socialSupport: 8, selfBlame: -3 } : { selfBlame: 2, professionalSupport: 3 }, counters: { caregivingTrips: 1, ...(option.id === "cancel-self" ? { missedAppointments: 1 } : { onTimeAppointments: 1 }) }, text: option.note }); }}><b>{option.label}</b><p>{option.note}</p></button>)}</div> : <><Consequence label="隔天" text={result} /><button type="button" className="main-action next-scene" onClick={() => go("system-dungeon", 49)}>四年後，重新鑑定通知</button></>}</>;
  }

  if (state.phase === "system-dungeon") {
    const index = Math.min(state.chapterProgress, SYSTEM_DUNGEON_TASKS.length - 1);
    const current = SYSTEM_DUNGEON_TASKS[index];
    const complete = state.chapterProgress >= SYSTEM_DUNGEON_TASKS.length;
    return <><Heading kicker="第十五章 · 49 歲 · 制度副本" title="任務：證明你仍然需要協助">這不是制度說明頁。你要真的找文件、掛號、請假、影印、等號碼，然後再跑一次。</Heading><div className="system-map">{SYSTEM_DUNGEON_TASKS.map((task, taskIndex) => <article key={task.id} className={taskIndex < state.chapterProgress ? "done" : taskIndex === state.chapterProgress ? "now" : "future"}><span>{task.place}</span><b>{task.label}</b><p>{taskIndex <= state.chapterProgress ? task.note : ""}</p></article>)}</div>{!complete ? <div className="dungeon-action"><span>目前地點 · {current.place}</span><h2>{current.label}</h2><p>{current.note}</p><button type="button" className="main-action" onClick={() => { dispatch({ type: "ADULT_ACTION", actionId: `system-${current.id}`, counters: { bureaucracyTrips: 1 }, text: current.note }); dispatch({ type: "ADVANCE_PROGRESS", text: current.note }); }}>執行</button></div> : <><Consequence label="收件完成" text="窗口蓋章，把資料收走。沒有升級音效。你得到一張收據、一個痠掉的腰，和暫時不用再證明自己的幾年。" /><button type="button" className="main-action next-scene" onClick={() => { dispatch({ type: "UNLOCK_MEMORY", memoryId: "copy-stack" }); go("group-chat", 57); }}>八年後，群組裡很吵</button></>}</>;
  }

  if (state.phase === "group-chat") {
    const replies = state.groupReplies;
    return <><Heading kicker="第十六章 · 57 歲 · 21:46–00:24" title="這裡沒有人每天都很有智慧">有人抱怨主管、有人睡過頭、有人只傳貼圖。不是每一句都要變成危機處理；很多時候，只是一起亂七八糟地活。</Heading><div className="group-phone"><header><div><b>晚點再睡（7）</b><span>完全虛構的角色與對話</span></div><i>{GROUP_MESSAGES.length + replies.length} 則訊息</i></header><div className="group-feed">{GROUP_MESSAGES.map((message, index) => <article key={`${message.time}-${message.name}-${index}`} className={message.tone === "quiet" ? "quiet" : ""}><time>{message.time}</time><b>{message.name}</b>{message.sticker ? <div className="fictional-sticker"><span>鳥</span><small>{message.sticker}</small></div> : <p>{message.text}</p>}</article>)}{replies.map((replyId, index) => { const option = GROUP_REPLY_OPTIONS.find((item) => item.id === replyId); return option ? <article className="player-message" key={replyId}><time>{`00:${String(2 + index * 6).padStart(2, "0")}`}</time><b>你</b><p>{option.label}</p><small>{option.result}</small></article> : null; })}</div></div><div className="group-reply-bar">{GROUP_REPLY_OPTIONS.map((option) => <button type="button" key={option.id} disabled={replies.includes(option.id)} onClick={() => { if (replies.length === 0) dispatch({ type: "UNLOCK_MEMORY", memoryId: "group-sticker" }); dispatch({ type: "GROUP_REPLY", replyId: option.id, effects: option.id === "here" ? { socialSupport: 7, masking: -4 } : {}, counters: { groupMessages: 1, lateNightJokes: option.id === "sticker" || option.id === "here" ? 1 : 0, ...(option.id === "here" ? { peopleBelieved: 1 } : {}) }, text: option.result }); dispatch({ type: "APPLY_CHOICE", flags: ["joinedGroup"], text: option.result }); }}>{option.label}</button>)}</div>{replies.length > 0 && <p className="speed-caption">{state.lastText}</p>}{replies.length >= 2 && <button type="button" className="main-action next-scene" onClick={() => go("adult-ordinary-day", 61)}>四年後，一個普通星期二</button>}</>;
  }

  if (state.phase === "adult-ordinary-day") {
    const day = [
      ["work", "上班", "開會、改檔案、跟同事一起嫌冷氣。"],
      ["lunch", "買午餐", "便當多送一顆滷蛋。這件事值得在群組宣布。"],
      ["home", "回家", "捷運有位置。你差點坐過站。"],
      ["medicine", "整理藥盒", "星期四沒有再掉到地上。"],
      ["game", "玩一小時遊戲", "輸了三場，第四場被隊友帶過。"],
      ["chat", "群組講垃圾話", "阿鳥宣布星期四無罪。"],
      ["sleep", "睡覺", "今天居然過完了。"],
    ] as const;
    const done = actionIds(state, "adult-day-").length;
    return <><Heading kicker="插頁 · 61 歲 · 沒有重大事件" title="今天也沒有發生什麼">疾病沒有消失，也沒有佔滿每一分鐘。今天的目標只是把星期二過成星期三。</Heading><div className="ordinary-list adult">{day.map(([id, label, text], index) => <button type="button" key={id} disabled={index !== done} className={index < done ? "done" : ""} onClick={() => dispatch({ type: "ADULT_ACTION", actionId: `adult-day-${id}`, counters: id === "lunch" ? { goodFood: 1 } : id === "chat" ? { lateNightJokes: 1, groupMessages: 1 } : id === "sleep" ? { ordinaryDays: 1 } : undefined, text })}><span>{String(index + 1).padStart(2, "0")}</span><b>{label}</b><p>{index < done ? text : ""}</p></button>)}</div>{done >= day.length && <button type="button" className="main-action next-scene" onClick={() => go("aging", 68)}>七年後，整理房間</button>}</>;
  }

  if (state.phase === "aging") {
    const seen = actionIds(state, "aging-").map((id) => id.replace("aging-", ""));
    return <><Heading kicker="第十七章 · 68 歲 · 下午" title="東西比病歷記得更多">你走得比以前慢一點。醫療沒有變簡單，但你已經知道哪些問題要寫下、誰可以陪、哪班公車比較不擠。</Heading><div className="aging-room">{AGING_OBJECTS.map((object) => <button type="button" key={object.id} disabled={seen.includes(object.id)} className={seen.includes(object.id) ? "seen" : ""} onClick={() => { if (object.id === "plant") dispatch({ type: "UNLOCK_MEMORY", memoryId: "new-leaf" }); dispatch({ type: "ADULT_ACTION", actionId: `aging-${object.id}`, counters: object.id === "plant" ? { plantsKeptAlive: 1 } : object.id === "tickets" ? { hospitalTrips: 1 } : undefined, text: object.note }); }}><span>{object.id === "pillbox" ? "盒" : object.id === "phone" ? "訊" : object.id === "plant" ? "葉" : object.id === "tickets" ? "票" : object.id === "lanyard" ? "證" : "簿"}</span><b>{object.label}</b></button>)}</div><div className="action-caption"><span>你拿起來看</span><p>{state.lastText}</p></div>{seen.length >= 4 && <button type="button" className="main-action next-scene" onClick={() => go("memory-review", 76)}>八年後，重新整理記憶冊</button>}</>;
  }

  if (state.phase === "memory-review") {
    const reviewed = actionIds(state, "review-").map((id) => id.replace("review-", ""));
    const interpretation: Record<string, string> = {
      "family-rule": "你終於明白，那句『不要說』曾經保護家裡，也讓你花了很多年才學會求助。兩件事可以同時是真的。",
      "school-signature": "空白簽名欄不是一個十二歲孩子沒有盡責的證明。那是大人的工作沒有被完成。",
      "company-lanyard": "工作證記得你假裝正常的日子，也記得你真的做得很好的專案。",
      "deleted-love-message": "不是每一段刪掉的話都永遠失去。後來你有幾次，真的把第二版送了出去。",
      "group-sticker": "一張貼圖沒有治好誰。它只是在很多個晚上，讓人知道畫面另一邊還有人。",
      "two-appointments": "你曾是病人、工作者、伴侶和照顧者。沒有哪個身分自動比其他身分更該消失。",
    };
    const reviewable = state.memories.filter((memory) => interpretation[memory.id]).slice(0, 6);
    return <><Heading kicker="第十八章 · 76 歲 · 記憶冊" title="有些碎片終於換了一種讀法">不是把童年全部解開。你只是現在有更多字，可以替當年的自己多說一點。</Heading><div className="review-grid">{reviewable.map((memory) => <button type="button" key={memory.id} disabled={reviewed.includes(memory.id)} className={reviewed.includes(memory.id) ? "reviewed" : ""} onClick={() => { dispatch({ type: "ADULT_ACTION", actionId: `review-${memory.id}`, text: interpretation[memory.id] }); dispatch({ type: "REINTERPRET_MEMORY", memoryId: memory.id, interpretation: interpretation[memory.id], age: 76 }); }}><span>{memory.ageFound} 歲</span><h2>{memory.titleAtTime}</h2><p>{reviewed.includes(memory.id) ? interpretation[memory.id] : memory.descriptionAtTime}</p></button>)}</div>{reviewed.length > 0 && <button type="button" className="secondary-memory-button" onClick={openMemory}>翻開完整記憶冊</button>}{reviewed.length >= Math.min(3, reviewable.length) && <button type="button" className="main-action next-scene" onClick={() => go("last-day", 82)}>六年後，一個普通下午</button>}</>;
  }

  if (state.phase === "last-day") {
    const done = actionIds(state, "last-").length;
    return <><Heading kicker="終章 · 82 歲 · 一個普通下午" title="今天沒有要完成的人生任務">沒有倒數，也沒有疾病失敗結局。桌上有藥盒、手機和一盆活得有點歪的植物。</Heading><div className="final-room"><div className="final-window" /><div className="final-plant" /><div className="final-phone">6 則未讀</div><div className="final-bowl" /><div className="older-character" /></div>{done < FINAL_DAY_ACTIONS.length ? <div className="final-actions">{FINAL_DAY_ACTIONS.map((action, index) => <button type="button" key={action.id} disabled={index !== done} className={index < done ? "done" : ""} onClick={() => dispatch({ type: "ADULT_ACTION", actionId: `last-${action.id}`, counters: action.id === "water" ? { plantsKeptAlive: 1 } : action.id === "food" ? { goodFood: 1 } : action.id === "message" ? { groupMessages: 1, lateNightJokes: 1 } : undefined, text: action.text })}>{action.label}</button>)}</div> : <><Consequence label="下午 16:18" text="你在熟悉的椅子上睡著。幾天後，生命在沒有戲劇性的清晨自然結束。群組裡有人傳晚安、有人傳錯貼圖、有人隔兩天才看見。" /><button type="button" className="main-action next-scene" onClick={() => go("life-summary", 82)}>看看病歷沒有記下的事</button></>}{done > 0 && done < FINAL_DAY_ACTIONS.length && <p className="speed-caption">{state.lastText}</p>}</>;
  }

  const stats = createLifeStatistics(state);
  return <div className="life-summary"><span className="tape-label">這一生 · 0–82 歲</span><h1>你的病歷記錄了很多事情，<br />但沒有記錄全部的人生。</h1><div className="life-stat-grid">{stats.map((stat) => <article key={stat.label} className={stat.tone === "warm" ? "warm" : ""}><span>{stat.label}</span><b>{stat.value}</b></article>)}</div><div className="final-words"><p>你沒有恢復成「從來沒生病的人」。你學會的是：怎麼帶著身體、記憶、藥袋、工作證、喜歡的人和一群很吵的朋友，把日子過完。</p><blockquote>有些事情，你一生都比別人更用力。也有很多時候，你只是活著、吃飯、笑得很大聲。</blockquote></div><div className="ending-actions"><button type="button" className="main-action" onClick={newLife}>再出生一次</button><button type="button" onClick={openMemory}>翻開這一生的記憶</button></div></div>;
}
