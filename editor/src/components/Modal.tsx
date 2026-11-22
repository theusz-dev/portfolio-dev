import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
};

/** A centred dialog. Escape and a click outside close it. */
export function Modal({ title, onClose, children, width = 440 }: Props) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    // Focus the first field.
    box.current?.querySelector<HTMLElement>("input, textarea, select, button[data-primary]")?.focus();
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={{ width }} ref={box}>
        <h2 className="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
