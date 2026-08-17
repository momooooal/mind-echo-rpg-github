import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);

test("covers a complete life course and provides safety resources", async () => {
  const page = await readFile(pageUrl, "utf8");
  for (const phrase of ["0 歲", "7 歲", "12 歲", "17 歲", "26 歲", "33 歲", "45 歲", "57 歲", "68 歲", "82 歲"]) {
    assert.match(page, new RegExp(phrase));
  }
  assert.match(page, /1925 安心專線/);
  assert.match(page, /這不是測驗/);
  assert.match(page, /去識別化/);
});

test("does not embed source group names or known member labels", async () => {
  const page = await readFile(pageUrl, "utf8");
  for (const privateLabel of ["秋桃", "阿豪", "聊天抒發二群", "躍動V世界"]) {
    assert.doesNotMatch(page, new RegExp(privateLabel, "i"));
  }
});
