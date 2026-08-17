export const MOVE_ITEMS = [
  { id: "documents", label: "證件資料夾", note: "租約、健保卡、轉介資料。", essential: true },
  { id: "medicine", label: "藥袋與回診單", note: "塞在衣服下面就不會被問。", essential: true },
  { id: "kettle", label: "小電鍋", note: "朋友說它可以煮所有東西。這是謊話。", essential: false },
  { id: "plant", label: "快不行的植物", note: "目前有兩片半的葉子。", essential: false },
  { id: "notebook", label: "舊聯絡簿", note: "你不知道為什麼把它留到現在。", essential: false },
  { id: "photo", label: "家庭合照", note: "那天所有人真的有笑。", essential: false },
  { id: "charger", label: "手機充電線", note: "不帶會在第一晚後悔。", essential: true },
  { id: "blanket", label: "洗到很薄的被子", note: "不值錢，但有熟悉的味道。", essential: false },
] as const;

export const FIRST_WORK_TASKS = [
  { id: "clock", label: "08:27 打卡", note: "你提早三分鐘。第一天先贏這個。" },
  { id: "names", label: "記同事名字", note: "怡君、怡潔、怡……她說沒關係。" },
  { id: "manual", label: "讀完操作手冊", note: "第三頁看了四次，最後還是會了。" },
  { id: "lunch", label: "跟同事買午餐", note: "他們抱怨星期一。你也抱怨。" },
  { id: "shift", label: "撐完第一個班", note: "工作完成得不錯。回家後沒有力氣洗頭。" },
] as const;

export const MASKING_MOMENTS = [
  { id: "arrival", who: "同事", line: "你今天看起來很累欸。", thought: "昨晚幾乎沒睡，車站的聲音也一直黏著。" },
  { id: "meeting", who: "主管", line: "下午簡報沒問題吧？", thought: "字在投影幕上漂，我需要十分鐘安靜。" },
  { id: "lunch", who: "同事", line: "一起吃飯？你最近都消失。", thought: "我想去。可是現在連咀嚼和聊天都像兩份工作。" },
] as const;

export const ADULT_CLINIC_TIMELINE = [
  { time: "07:10", label: "起床", note: "今天請半天假。" },
  { time: "08:03", label: "公車", note: "座位滿了，站到轉乘站。" },
  { time: "08:47", label: "捷運", note: "主管傳：下午兩點前回得來嗎？" },
  { time: "09:18", label: "掛號", note: "第 071 號。你已經很熟悉這張紙。" },
  { time: "10:46", label: "候診", note: "藥袋剩三天，號碼還有七號。" },
  { time: "11:37", label: "看診", note: "你說最近白天很想睡、食慾改變，工作開始受影響。" },
  { time: "11:46", label: "結束", note: "醫師和你討論不同取捨與後續追蹤，沒有叫你自行調整。" },
  { time: "12:35", label: "領藥", note: "還沒吃午餐。" },
  { time: "13:42", label: "回公司", note: "同事問：休假去哪玩？" },
] as const;

export const CARE_OPTIONS = [
  { id: "cancel-self", label: "取消自己的回診，陪家人", note: "最直接，也最熟悉。" },
  { id: "network", label: "打給手足、朋友與醫院交通服務", note: "要解釋很多次，也可能有人答應。" },
  { id: "reschedule-family", label: "守住自己的回診，協助家人改期", note: "界線不會自動消除內疚。" },
] as const;

export const SYSTEM_DUNGEON_TASKS = [
  { id: "form", place: "家裡", label: "找申請表", note: "你下載到去年的版本。" },
  { id: "copy", place: "超商", label: "印身分證與診斷資料", note: "機器退了兩次硬幣。" },
  { id: "clinic", place: "醫院", label: "掛重新鑑定門診", note: "最近的時段是三週後。" },
  { id: "leave", place: "公司", label: "再請一次假", note: "主管只回了一個『收到』。" },
  { id: "counter", place: "區公所", label: "排到 108 號窗口", note: "目前叫到 91。" },
  { id: "missing", place: "窗口", label: "補一張三個月內的證明", note: "你昨天就是來補這張。日期差了一天。" },
  { id: "return", place: "三週後", label: "再跑一次", note: "這次資料齊了。你沒有得到寶箱，只得到收件章。" },
] as const;

export type ChatMessage = { time: string; name: string; text?: string; sticker?: string; tone?: "quiet" | "system" };

export const GROUP_MESSAGES: ChatMessage[] = [
  { time: "21:46", name: "米糕", text: "我睡到便當店打烊" },
  { time: "21:46", name: "N", sticker: "一隻鳥倒在地上" },
  { time: "21:47", name: "阿鳥", text: "那你晚餐吃啥" },
  { time: "21:48", name: "米糕", text: "早餐店" },
  { time: "21:48", name: "33", text: "這個邏輯我給過" },
  { time: "21:50", name: "魚", text: "今天主管問我為什麼又請假，我差點回他因為醫院白天開" },
  { time: "21:51", name: "藍莓", text: "這回答太合理會被公司封印" },
  { time: "21:53", name: "小葉", text: "有人吃晚餐了嗎" },
  { time: "21:54", name: "N", text: "泡麵，加一顆很努力的蛋" },
  { time: "22:07", name: "阿鳥", text: "今天藥盒掉地上，我跟星期四絕交" },
  { time: "22:09", name: "米糕", text: "星期四：？？" },
  { time: "23:58", name: "小葉", text: "今天有點卡住，不太想處理明天", tone: "quiet" },
] as const;

export const GROUP_REPLY_OPTIONS = [
  { id: "sticker", label: "傳一隻趴著的鳥", result: "N 回了一隻坐在旁邊的鳥。沒有人要求貼圖解釋自己。" },
  { id: "food", label: "先問：你晚餐吃了嗎？", result: "小葉：還沒。米糕開始認真辯論哪家粥比較不難吃。" },
  { id: "here", label: "我在。現在想有人陪你講垃圾話，還是先安靜？", result: "過了三分鐘，小葉回：垃圾話。阿鳥立刻貼出星期四道歉聲明。" },
  { id: "later", label: "打了一段，最後只按已讀", result: "你不知道怎麼回。半小時後再打開時，已經有人陪小葉聯絡身邊可信任的人。" },
] as const;

export const AGING_OBJECTS = [
  { id: "pillbox", label: "七格藥盒", note: "字變小了。你在星期格貼上不同觸感的膠帶。" },
  { id: "phone", label: "群組手機", note: "N 換了第三次名字，貼圖還是同一隻鳥。" },
  { id: "plant", label: "窗邊植物", note: "枯過兩次，又長出一片新葉。" },
  { id: "tickets", label: "一疊車票", note: "自己的、家人的、陪別人的。已經分不太出來。" },
  { id: "lanyard", label: "舊工作證", note: "你做完很多案子。公司系統早就查不到了。" },
  { id: "notebook", label: "童年聯絡簿", note: "空白簽名欄還在。你不再覺得那是小孩的失敗。" },
] as const;

export const FINAL_DAY_ACTIONS = [
  { id: "water", label: "替植物澆水", text: "水有一點倒到桌上。葉子沒有抱怨。" },
  { id: "food", label: "吃一碗喜歡的麵", text: "味道比昨天淡一點，還是很好吃。" },
  { id: "message", label: "在群組說晚安", text: "小葉回了一張早安貼圖。時間完全不對。" },
  { id: "nap", label: "躺下午覺", text: "窗戶留了一條縫。外面有人牽車、樓上在拖椅子。" },
] as const;
