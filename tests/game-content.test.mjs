import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

async function sourceText(directory = "app") {
  const root = path.join(projectRoot, directory);
  const files = await readdir(root, { recursive: true, withFileTypes: true });
  const sourceFiles = files
    .filter((entry) => entry.isFile() && /\.(tsx?|mjs)$/.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name));
  return (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
}

test("implements a playable childhood without a disease selector", async () => {
  const page = await read("app/page.tsx");
  for (const phrase of ["0 歲", "7 歲", "12 歲", "14 歲", "17 歲", "13–18", "第一次門診"]) {
    assert.match(page, new RegExp(phrase));
  }
  assert.match(page, /沒有疾病選單/);
  assert.doesNotMatch(page, /選擇這一輪想體驗的路線/);
  assert.doesNotMatch(page, /StatPanel|feedbackCard|同理心\s*\+\s*10/);
});

test("continues the same playable life through adulthood, aging, and natural death", async () => {
  const page = await read("app/page.tsx");
  const adult = await read("app/game/components/AdultChapters.tsx");
  for (const age of ["21 歲", "23 歲", "28 歲", "32 歲", "34 歲", "35 歲", "41 歲", "45 歲", "49 歲", "57 歲", "61 歲", "68 歲", "76 歲", "82 歲"]) {
    assert.match(adult, new RegExp(age));
  }
  for (const phase of ["moving-out", "first-work", "relationship", "masking-work", "adult-clinic", "work-disclosure", "career-project", "caregiving", "system-dungeon", "group-chat", "aging", "memory-review", "last-day", "life-summary"]) {
    assert.match(page + adult, new RegExp(phase));
  }
  assert.match(adult, /自然結束/);
  assert.match(adult, /你的病歷記錄了很多事情/);
  assert.match(adult, /沒有記錄全部的人生/);
  assert.doesNotMatch(adult, /自殺結局|疾病失敗結局\s*：/);
});

test("keeps hidden multifactor traits, five family seeds, events, and long-term memory data", async () => {
  const types = await read("app/game/types.ts");
  const families = await read("app/game/data/families.ts");
  const events = await read("app/game/data/events.ts");
  const memories = await read("app/game/data/memories.ts");
  for (const trait of ["biologicalSensitivity", "moodVulnerability", "sleepDebt", "familyStress", "financialStress", "masking", "socialSupport"]) {
    assert.match(types, new RegExp(trait));
  }
  for (const seed of ["unspoken", "closed", "warm", "stretched", "caregiving"]) {
    assert.match(families, new RegExp(`id: "${seed}"`));
  }
  assert.match(events, /LifeEvent/);
  assert.match(memories, /reinterpretAtAge/);
  assert.match(memories, /linkedEventIds/);
});

test("turns inconvenience into mechanics and preserves accessibility", async () => {
  const page = await read("app/page.tsx");
  const dialogue = await read("app/game/components/DialogueBox.tsx");
  const css = await read("app/globals.css");
  assert.match(page, /const DISTRACTIONS = \[/);
  for (const distraction of ["boss", "group", "washer", "video", "alarm", "weather", "thought"]) {
    assert.match(page, new RegExp(`\\["${distraction}"`));
  }
  assert.match(page, /MORNING_ACTION/);
  assert.match(page, /讓時間往前/);
  assert.match(page, /想說/);
  assert.match(dialogue, /真正說出口/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(page, /降低干擾效果/);
});

test("adult inconvenience is played through rather than explained as a lesson", async () => {
  const adult = await read("app/game/components/AdultChapters.tsx");
  const data = await read("app/game/data/adultEvents.ts");
  const stats = await read("app/game/engine/lifeStats.ts");
  for (const mechanic of ["MOVE_ITEMS", "FIRST_WORK_TASKS", "MASKING_MOMENTS", "ADULT_CLINIC_TIMELINE", "SYSTEM_DUNGEON_TASKS", "GROUP_MESSAGES", "AGING_OBJECTS", "FINAL_DAY_ACTIONS"]) {
    assert.match(adult + data, new RegExp(mechanic));
  }
  for (const counter of ["workedWhileExhausted", "maskedAtWork", "onTimeAppointments", "missedAppointments", "bureaucracyTrips", "lateNightJokes", "plantsKeptAlive"]) {
    assert.match(stats, new RegExp(counter));
  }
  assert.doesNotMatch(adult, /善意歧視|你今天學會|同理心\s*\+/);
});

test("support group is a fictional living chat, not a crisis-support quiz", async () => {
  const data = await read("app/game/data/adultEvents.ts");
  for (const fictionalName of ["小葉", "米糕", "魚", "N", "阿鳥", "33", "藍莓"]) {
    assert.match(data, new RegExp(fictionalName));
  }
  assert.match(data, /泡麵|貼圖|主管|晚餐/);
  assert.doesNotMatch(data, /請選出.*正確|正確危機支持語句|答對/);
});

test("retains safety resources without turning crisis into an ending", async () => {
  const all = await sourceText();
  assert.match(all, /1925/);
  assert.match(all, /119 \/ 110/);
  assert.match(all, /沒有以生命危機作為結局/);
  assert.doesNotMatch(all, /自殺 ending|傷害程度排行榜/);
});

test("does not embed source group names or known member labels", async () => {
  const all = `${await sourceText()}\n${await read("README.md")}`;
  for (const privateLabel of ["秋桃", "阿豪", "聊天抒發二群", "躍動V世界"]) {
    assert.doesNotMatch(all, new RegExp(privateLabel, "i"));
  }
});
