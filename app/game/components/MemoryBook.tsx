import type { MemoryFragment } from "../types";

export function MemoryBook({ memories, onClose }: { memories: MemoryFragment[]; onClose: () => void }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="memory-title">
      <section className="memory-book">
        <header><div><span>不是答案，只是留下來的東西</span><h2 id="memory-title">記憶碎片</h2></div><button type="button" onClick={onClose} aria-label="關閉記憶冊">關閉</button></header>
        {memories.length === 0 ? <p className="empty-memory">目前還沒有能說清楚的記憶。</p> : (
          <div className="memory-grid">
            {memories.map((memory, index) => (
              <article key={memory.id} className={memory.interpretation ? "reinterpreted" : ""}>
                <span>碎片 #{String(index + 1).padStart(2, "0")} · {memory.ageFound} 歲</span>
                <h3>{memory.titleAtTime}</h3>
                <p>{memory.descriptionAtTime}</p>
                {memory.interpretation ? <div><b>{memory.reinterpretAtAge} 歲，重新看見</b><p>{memory.interpretation}</p></div> : <i>答案未明</i>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
