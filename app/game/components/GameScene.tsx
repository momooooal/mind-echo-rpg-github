"use client";

import { useState } from "react";

export type SceneObject = {
  id: string;
  label: string;
  icon: string;
  className: string;
  disabled?: boolean;
  visited?: boolean;
};

export function GameScene({
  className,
  label,
  objects,
  onInteract,
  children,
}: {
  className: string;
  label: string;
  objects: SceneObject[];
  onInteract: (id: string) => void;
  children?: React.ReactNode;
}) {
  const [target, setTarget] = useState<string>("");

  const interact = (object: SceneObject) => {
    if (object.disabled) return;
    setTarget(object.id);
    window.setTimeout(() => onInteract(object.id), 180);
  };

  return (
    <div className={`game-scene ${className}`} aria-label={label}>
      <div className={`player-token target-${target}`} aria-hidden="true"><span /></div>
      {objects.map((object) => (
        <button
          type="button"
          key={object.id}
          className={`scene-object ${object.className} ${object.visited ? "visited" : ""}`}
          disabled={object.disabled}
          onClick={() => interact(object)}
          aria-label={`${object.visited ? "再次查看" : "查看"}${object.label}`}
        >
          <span aria-hidden="true">{object.icon}</span>
          <b>{object.label}</b>
        </button>
      ))}
      {children}
    </div>
  );
}
