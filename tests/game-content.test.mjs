import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("core loop is a movable world instead of chapter cards", () => {
  assert.match(page, /WASD \/ 方向鍵移動/);
  assert.match(page, /const move = useCallback/);
  assert.match(page, /hotspot/);
  assert.match(page, /world-v4/);
  assert.doesNotMatch(page, /teenPattern/);
});

test("events are optional and can be missed", () => {
  assert.match(page, /可以錯過/);
  assert.match(page, /missedBus/);
  assert.match(page, /thingsMissed/);
  assert.match(page, /skipCounselor/);
  assert.match(page, /skipClinicAdult/);
});

test("memory clues can be reinterpreted later", () => {
  assert.match(page, /不能碰的白色袋子/);
  assert.match(page, /reinterpretMemory/);
  assert.match(page, /17 歲：你第一次意識到/);
});

test("ordinary life and peer chat coexist with mental illness", () => {
  assert.match(page, /泡麵/);
  assert.match(page, /咖啡機/);
  assert.match(page, /便利商店的飯不是人生轉捩點/);
  assert.match(page, /病友群/);
});

test("no diagnosis picker or harmful method gameplay", () => {
  assert.doesNotMatch(page, /選擇你要體驗哪一種精神疾病/);
  assert.doesNotMatch(page, /自殺 ending/i);
  assert.match(page, /未呈現具體自傷方法/);
});

test("mobile controls and overlays exist", () => {
  assert.match(css, /\.mobile-controls/);
  assert.match(css, /\.phone-v4/);
  assert.match(css, /\.memory-v4/);
  assert.match(css, /@media\(max-width:720px\)/);
});
