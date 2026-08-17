import type { AccessibilitySettings } from "../types";

export function PauseMenu({
  settings,
  onSetting,
  onClose,
  onExit,
}: {
  settings: AccessibilitySettings;
  onSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  onClose: () => void;
  onExit: () => void;
}) {
  return (
    <div className="overlay pause-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <section className="pause-card">
        <span>遊戲已暫停</span><h2 id="pause-title">你不需要一次走完。</h2>
        <div className="pause-settings">
          <div><input id="soft-mode-control" type="checkbox" checked={settings.softMode} onChange={(event) => onSetting("softMode", event.target.checked)} /><label htmlFor="soft-mode-control"><b>柔和文字</b><small>降低生命危機與家庭衝突文字強度。</small></label></div>
          <div><input id="distraction-control" type="checkbox" checked={settings.reducedDistractions} onChange={(event) => onSetting("reducedDistractions", event.target.checked)} /><label htmlFor="distraction-control"><b>降低干擾效果</b><small>保留任務提示、減少視窗移動，不改變故事。</small></label></div>
        </div>
        <div className="grounding"><b>先回到現在</b><p>雙腳踩地。看看身邊三樣有顏色的東西。慢慢吐氣，不用配合遊戲的速度。</p></div>
        <div className="resource-links"><a href="tel:1925"><b>1925</b><span>台灣 24 小時安心專線</span></a><a href="tel:119"><b>119 / 110</b><span>有立即危險時</span></a></div>
        <div className="pause-actions"><button type="button" className="main-action" onClick={onClose}>回到這一刻</button><button type="button" onClick={onExit}>先離開，保留進度</button></div>
      </section>
    </div>
  );
}
