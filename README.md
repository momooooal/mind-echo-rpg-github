# 一生的回聲

> 如果你在 GitHub 看到這段文字，這是程式庫說明頁，不是遊戲。
>
> 遊戲網址格式：`https://你的帳號.github.io/mind-echo-rpg-github/`

一款人生模擬 × 養成 RPG × 敘事解謎遊戲。

核心不是讓玩家選一種疾病來「體驗」，而是讓玩家先活進一段人生，慢慢發現某些普通事情需要比別人更多力氣。

目前已完成從出生到 82 歲自然死亡的可玩人生。前半生保留完整的探索與症狀玩法，成年後的選擇會延續童年旗標、記憶與隱藏狀態：

- 出生時建立不可見的多因素生命參數
- 五種不會直接顯示名稱的家庭起點
- 7 歲可探索客廳與童年記憶碎片
- 家庭秘密形成長期旗標
- 12 歲上學日：啟動困難、七個干擾視窗、遺忘與趕車
- 一個真的什麼都沒發生的普通日
- 由隱藏條件觸發的青少年生活干擾，不提供疾病選單
- 「想說的話」與「真正說出口的話」
- 求助或沒有求助的不同後續
- 從 07:10 到 12:35 的第一次門診行程
- 治療與生活影響的討論，不把吃藥設計成加分題
- 童年白色袋子的第一次重新解讀；部分答案仍保持未知
- 19–25 歲：離家裝箱、第一份工作與普通同事關係
- 26–35 歲：戀愛訊息、反覆 Masking、半日回診與延遲出現的職場揭露後果
- 36–50 歲：能力可見的職涯專案、照顧衝突與必須親自跑完的制度副本
- 51–65 歲：七名完全虛構病友的生活群組，以及一個什麼大事都沒發生的星期二
- 65 歲以上：老化房間、晚年重新理解記憶、普通的最後一天與自然死亡
- 結尾依實際遊玩生成生活統計；病歷之外也會記得笑、植物、好吃的東西與深夜垃圾話

## GitHub Pages

已建置好的靜態網站放在 `docs/`。請將整個專案上傳後，到 repository：

1. **Settings → Pages**
2. **Source：Deploy from a branch**
3. Branch 選 `main`
4. Folder 選 **`/docs`**，不要選 `/(root)`
5. 儲存後按 GitHub 顯示的 **Visit site**

修改遊戲後重新產生 `docs/`：

```bash
pnpm install
pnpm build:github
```

## 本機開發與檢查

需求：Node.js 22.13 以上、pnpm 11。

```bash
pnpm install
pnpm dev

pnpm typecheck
pnpm test
pnpm lint
pnpm build
pnpm build:github
```

## 程式結構

```text
app/
  page.tsx                     # 0–18 歲場景與全人生路由
  globals.css                  # 場景、RPG UI、響應式與動態效果
  game/
    types.ts                   # state、事件、記憶與隱藏特質型別
    engine/
      createGame.ts            # 生命 seed、隱藏特質、青少年事件推導
      reducer.ts               # 存檔友善的遊戲狀態轉移
      lifeStats.ts             # 依實際遊玩生成最終人生統計
    data/
      families.ts              # 五種家庭起點與場景差異
      events.ts                # 童年事件、可探索物件與第一次門診
      adultEvents.ts           # 成年玩法、制度副本、虛構群組與晚年物件
      memories.ts              # 記憶碎片與跨事件連結
    components/
      AdultChapters.tsx        # 21–82 歲可玩人生章節
      GameScene.tsx            # point-and-click 場景
      DialogueBox.tsx          # 想說／真正說出口
      StatusSignals.tsx        # 非數值生活訊號
      MemoryBook.tsx           # 記憶碎片與重新解讀
      PauseMenu.tsx            # 暫停、柔和模式、降低干擾與即時資源
public/og-v3.png                # 完整人生版手繪遊戲分享圖
github-src/                    # GitHub Pages 的 Vite 入口
docs/                          # 可直接發布的靜態成品
tests/                         # 內容、架構、隱私與安全界線測試
```

## 新增一個人生情境

童年事件放在 `app/game/data/events.ts`，成年玩法資料放在 `app/game/data/adultEvents.ts`，並使用年齡、條件、隱藏效果、記憶與未來旗標。只有場景需要特殊操作時，才在對應元件加入呈現；不要把新故事重新全部塞回 `page.tsx`。

事件的後果應使用未來旗標或隱藏特質回到後續人生，不要顯示 `支持 +10`，也不要在選擇後跳出教育意義。

## 內容與安全界線

本作受到病友支持團體的共同生活經驗啟發，但所有角色、家庭、時間、職業、事件與對話均為融合後重新創作。不得加入真實群名、暱稱、病歷、可辨識事件或完整原句。

涉及生命危機時，不呈現具體方式、不做成操作玩法、不當作失敗結局。暫停選單固定提供台灣 1925 安心專線；有立即危險時使用 119 或 110。
