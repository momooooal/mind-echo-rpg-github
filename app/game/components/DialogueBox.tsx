"use client";

export type SpokenChoice = {
  id: string;
  label: string;
  subtext?: string;
  disabled?: boolean;
};

export function DialogueBox({
  speaker,
  text,
  thought,
  choices,
  onChoose,
}: {
  speaker: string;
  text: string;
  thought?: string;
  choices?: SpokenChoice[];
  onChoose?: (id: string) => void;
}) {
  return (
    <section className="dialogue-panel" aria-live="polite">
      <p className="speaker">{speaker}</p>
      <div className="spoken-line">{text}</div>
      {thought && (
        <div className="thought-layer">
          <span>你想說</span>
          <p>{thought}</p>
        </div>
      )}
      {choices && onChoose && (
        <div className="speech-choices" aria-label="真正說出口的話">
          <p>真正說出口</p>
          {choices.map((choice) => (
            <button type="button" key={choice.id} disabled={choice.disabled} onClick={() => onChoose(choice.id)}>
              <strong>{choice.label}</strong>
              {choice.subtext && <span>{choice.subtext}</span>}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
