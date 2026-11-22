import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export type Toast = { id: number; kind: "info" | "error" | "success"; text: string };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);
  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (kind: Toast["kind"], text: string) => {
      const id = next.current++;
      setToasts((list) => [...list.slice(-3), { id, kind, text }]);
      setTimeout(() => dismiss(id), kind === "error" ? 9000 : 4000);
    },
    [dismiss],
  );
  return { toasts, push, dismiss };
}

export function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" data-kind={toast.kind}>
          <span>{toast.text}</span>
          <button type="button" className="icon-button small" onClick={() => dismiss(toast.id)} aria-label="Fechar">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
