import type { FamilySeedId, HiddenEffect } from "../types";

export type FamilySeed = {
  id: FamilySeedId;
  opening: string;
  breakfast: string;
  secrecyLine: string;
  roomTone: string;
  modifiers: HiddenEffect;
  objectText: Record<string, string>;
  clinicInterpretation: string;
};

export const FAMILY_SEEDS: FamilySeed[] = [
  {
    id: "unspoken",
    opening: "家裡的人彼此相愛，但有些日子，大人的表情像沒關好的門。",
    breakfast: "昨天媽媽把客廳整理得一塵不染。今天中午了，她還沒起床。",
    secrecyLine: "媽媽只是太累。家裡的事，不要拿去學校講。",
    roomTone: "昨晚有人說話說到凌晨，今天整間屋子只剩冰箱的聲音。",
    modifiers: { familyStress: 13, moodVulnerability: 8, masking: 7, socialSupport: -2 },
    objectText: {
      fridge: "冰箱裡有蛋、有半罐牛奶，還有一張字很大的便條：『不要忘記吃。』",
      door: "門縫沒有光。你靠近時，爸爸從後面說：不要去吵媽媽。",
      phone: "答錄機紅燈閃著。女聲只說了醫院、星期四、不要忘記。",
      bin: "幾個拆開的紙盒壓在垃圾桶下面。你認得昨天媽媽買回來的杯子。",
      notebook: "老師寫：『今天又在課堂睡著，請家長留意。』你不知道該給誰簽。",
      bill: "一張沒有繳的電費單。紅色日期已經過了。",
      bag: "白色袋子上有很多小字。你只看懂『○○身心○○』，還有媽媽的名字。",
      sofa: "每個抱枕都排得很直。昨晚媽媽說，客廳終於變成她腦中應有的樣子。",
      shopping: "門邊堆著四個購物袋。裡面有三支一樣的檯燈。",
    },
    clinicInterpretation: "同樣的院徽、同樣的白色袋子。多年後，媽媽才說，那段時間她也曾到這裡看診。那不是你生病的單一原因；只是家裡一直沒有人知道該怎麼談。",
  },
  {
    id: "closed",
    opening: "家裡講究規矩。難過可以，最好五分鐘內整理好。",
    breakfast: "冰箱很滿、制服熨得很平。大人不喜歡意外，也不喜歡別人問太多。",
    secrecyLine: "我們家很好。老師如果問，就說很好，懂嗎？",
    roomTone: "這個家很整齊。整齊到你不知道哪些東西不能碰、哪些話不能說。",
    modifiers: { stigmaExposure: 16, masking: 12, selfBlame: 8, familyStress: 6 },
    objectText: {
      fridge: "冰箱上是每個人的時間表。你的格子旁寫著：『不要拖拖拉拉。』",
      door: "房門關著。裡面傳來低聲爭吵，門開時，大人立刻換成普通的臉。",
      phone: "老師留言問你最近是不是常常沒睡。爸爸聽完後按了刪除。",
      bin: "垃圾桶裡是一張被撕掉的輔導室通知。你只拼得出自己的班級。",
      notebook: "聯絡簿每一頁都簽得很漂亮。今天那頁寫著：『上課發呆。』",
      bill: "補習班繳費單已經蓋章。背面有你畫到一半的小人。",
      bag: "白色袋子沒有名字，只有醫院院徽。你被叫住：那不是小孩該看的。",
      sofa: "沙發套沒有皺。你坐下後，下意識把壓痕拍平。",
      shopping: "玄關只有兩雙鞋，鞋尖朝同一方向。你的鞋帶散開了。",
    },
    clinicInterpretation: "你認得那個院徽，卻仍不知道七歲的袋子屬於誰、裡面是什麼。有些家庭秘密長大後也不會自動變成答案。",
  },
  {
    id: "warm",
    opening: "家裡大多時候很溫暖。只是大家都把心理困擾當成『想太多』。",
    breakfast: "媽媽會在便當裡放切好的水果，也會在你哭太久時問：到底有什麼好難過？",
    secrecyLine: "不是不能說啦，只是老師很忙，這點小事不用麻煩人家。",
    roomTone: "桌上有一家人的照片。沒有人故意傷害你，也沒有人知道你需要什麼。",
    modifiers: { socialSupport: 13, stigmaExposure: 7, selfBlame: 5, familyStress: -5 },
    objectText: {
      fridge: "冰箱塞滿切好的水果。便條寫：『記得帶雨傘，愛你。』",
      door: "門半開著。媽媽在睡午覺，床邊擺著看了一半的小說。",
      phone: "阿姨留言：週末要不要去吃火鍋？後面有人大聲問你愛不愛玉米。",
      bin: "垃圾桶裡有燒焦的鬆餅。早上大家笑了很久，最後吃吐司。",
      notebook: "老師寫你最近常忘記交作業。媽媽回：『他只是比較隨性。』",
      bill: "帳單都夾在磁鐵下。旁邊有你上次考七十分得到的笑臉。",
      bag: "白色袋子印著醫院院徽。裡面是外婆上次住院留下的紙張，字太多了。",
      sofa: "沙發縫裡有一顆糖。你決定先放口袋，沒有告訴任何人。",
      shopping: "門邊是一袋火鍋料。最上面是你不吃的芋頭。",
    },
    clinicInterpretation: "你終於想起，那只白袋子其實來自外婆看身體疾病的住院。相似不等於相同。你今天來到這裡，是許多因素一起走到的結果。",
  },
  {
    id: "stretched",
    opening: "這個家總是在算：房租、時間、誰能請假，以及冰箱還能撐幾天。",
    breakfast: "大人很早出門、很晚回家。不是沒有人在乎，只是每個人都已經用完了。",
    secrecyLine: "不要跟老師講，講了他們也只是打電話來，誰有時間去學校？",
    roomTone: "屋裡有許多還沒處理的事。每一件都不大，加起來卻沒有地方站。",
    modifiers: { financialStress: 18, familyStress: 12, sleepDebt: 5, socialSupport: -5 },
    objectText: {
      fridge: "冰箱只剩半盒蛋和醬油。你知道月底不要說想喝牛奶。",
      door: "房裡沒有人。媽媽去上第二份班，棉被維持早上掀開的樣子。",
      phone: "答錄機有學校、銀行和一通無聲留言。你不確定哪個最急。",
      bin: "垃圾桶裡是便利商店飯糰包裝。集點貼紙被仔細撕下來。",
      notebook: "老師提醒要交戶外教學費用。簽名欄空了三天。",
      bill: "紅色的『逾期』你看得懂。金額後面有好多個零。",
      bag: "白色醫院袋裡是爸爸手傷的收據。你只記得他那週不能工作。",
      sofa: "沙發上放著摺到一半的制服。袖口補過一次。",
      shopping: "門邊沒有購物袋，只有鄰居送來的一袋青菜。",
    },
    clinicInterpretation: "院徽一樣，但七歲的袋子是爸爸的手傷。你明白自己曾把許多線索拼成一個答案；那個答案不完全對，當年的壓力卻是真的。",
  },
  {
    id: "caregiving",
    opening: "家裡有一位需要長期照顧的大人。你很早就學會看時鐘、拿水和保持安靜。",
    breakfast: "別人問你長大想做什麼。你先想的是：那時候家裡誰能陪阿公去醫院？",
    secrecyLine: "家裡已經夠忙了。你乖一點，不要再讓大家擔心。",
    roomTone: "客廳像半個家、半個候診間。大人稱讚你懂事，你不知道能不能不要懂。",
    modifiers: { familyStress: 15, traumaLoad: 6, selfBlame: 10, socialSupport: 4 },
    objectText: {
      fridge: "冰箱門貼著阿公的吃藥時間。你比九九乘法更早背起來。",
      door: "房門開著一條縫。照顧者在裡面睡著，手還握著毛巾。",
      phone: "醫院留言更改復健時間。你拿鉛筆抄在手背上。",
      bin: "垃圾桶裡有很多棉花和包裝。大人說不要碰，你已經知道了。",
      notebook: "老師寫你又沒參加課後活動。你沒有告訴她你要回家顧門。",
      bill: "看護費和復健車資釘在一起。你只知道大人看到會嘆氣。",
      bag: "白色袋子裝著阿公的門診紙。醫院名稱有一半被折起來。",
      sofa: "沙發旁放著一條薄被。今晚輪到誰睡這裡，還沒決定。",
      shopping: "袋子裡是成人紙尿褲和你偷偷放進去的巧克力。",
    },
    clinicInterpretation: "你認得的是醫院袋子的觸感，不是相同的病。童年的照顧責任沒有『造成一切』，但它確實教會你的身體長期保持待命。",
  },
];

export function getFamilySeed(id: FamilySeedId): FamilySeed {
  return FAMILY_SEEDS.find((family) => family.id === id) ?? FAMILY_SEEDS[0];
}
