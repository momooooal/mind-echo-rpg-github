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

test("implements a playable 0–18 vertical slice instead of a disease selector", async () => {
  const page = await read("app/page.tsx");
  for (const phrase of ["0 歲", "7 歲", "12 歲", "14 歲", "17 歲", "十八歲生日", "第一次門診"]) {
    assert.match(page, new RegExp(phrase));
  }
  assert.match(page, /沒有疾病選單/);
  assert.doesNotMatch(page, /選擇這一輪想體驗的路線/);
  assert.doesNotMatch(page, /StatPanel|feedbackCard|同理心\s*\+\s*10/);
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
