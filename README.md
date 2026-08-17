# 一生的回聲

一款由病友支持團體的共同生命經驗啟發、從出生走到晚年的精神健康生命體驗 RPG。玩家會經歷家庭沉默、症狀出現、就醫、工作、照顧責任、互助團體與危機支持計畫；遊戲沒有生命值、好壞結局或自殺結局。

所有角色、事件與對話均為融合多種經驗後重新編寫的虛構內容。原始聊天紀錄、成員姓名、帳號與可辨識原句均未放入網站，也不會由網站蒐集任何個人資料。

## 直接放上 GitHub Pages

專案已將可直接發布的靜態版本產生在 `docs/`：

1. 把整個資料夾上傳到 GitHub repository。
2. 到 repository 的 **Settings → Pages**。
3. 在 **Build and deployment** 選擇 **Deploy from a branch**。
4. 選擇 `main` branch 與 `/docs` folder，儲存即可。

如果網站之後有修改，先執行：

```bash
pnpm install
pnpm build:github
```

再提交更新後的 `docs/`。

## 本機開發

需求：Node.js 22.13 以上、pnpm 11。

```bash
pnpm install
pnpm dev
```

正式檢查：

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm build:github
```

## 編輯故事

- 遊戲劇情與互動：`app/page.tsx`
- 視覺與響應式樣式：`app/globals.css`
- GitHub Pages 入口：`github-src/index.html`
- 分享預覽圖：`public/og.png`

若要新增真實經驗，請繼續遵守三個原則：合併多人的經驗、改寫可辨識細節、不要把任何人的危機訊息當成娛樂性失敗結局。正式公開前，建議邀請至少兩位具有不同診斷或生命背景的病友試玩並取得同意。

## 即時資源

遊戲內固定提供暫停選單。台灣可撥 1925 安心專線；有立即危險時撥 119 或 110。
