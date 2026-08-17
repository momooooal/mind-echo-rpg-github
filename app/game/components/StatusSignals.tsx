import type { BodySignals } from "../types";

export function StatusSignals({ signals }: { signals: BodySignals }) {
  const rows = [
    ["睡眠", signals.sleep],
    ["腦袋", signals.mind],
    ["身體", signals.body],
    ["人", signals.people],
  ];
  return (
    <aside className="signal-panel" aria-label="今天的生活訊號">
      <header><span>手機 / 今天</span><b>{signals.unread ? `${signals.unread} 則未讀` : "沒有新訊息"}</b></header>
      <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="next-card"><span>接下來</span><p>{signals.next}</p></div>
      <small>這裡沒有生命值。角色知道的，只有今天的身體和待辦。</small>
    </aside>
  );
}
