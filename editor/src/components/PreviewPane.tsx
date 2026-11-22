import { AlertTriangle, Monitor, Moon, MoveHorizontal, Smartphone, Sun } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { READY_MESSAGE, type PreviewApi, type PreviewPayload, type PreviewStatus } from "../preview/protocol";

export type PreviewWidth = "fluid" | "desktop" | "mobile";
export type PreviewHandle = { api: () => PreviewApi | null };

type Props = {
  payload: PreviewPayload | null;
  theme: "light" | "dark";
  /** False pauses the preview's animations (dialogs open, window in the background). */
  animate: boolean;
  onTheme: (theme: "light" | "dark") => void;
  width: PreviewWidth;
  onWidth: (width: PreviewWidth) => void;
  status: PreviewStatus;
  onStatus: (status: PreviewStatus) => void;
  onScroll: () => void;
  /** Error line in editor coordinates, when it maps to the body. */
  errorLine: number | null;
  onGotoError: () => void;
};

const DESKTOP = 1280;
const MOBILE = 390;

/** The site's reading page in an iframe (preview.html), so its CSS and media queries are the site's own. */
export const PreviewPane = forwardRef<PreviewHandle, Props>(function PreviewPane(props, ref) {
  const { payload, theme, width, status } = props;
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  /** Counts "ready" messages: the frame can reload (HMR), and each load needs the payload again. */
  const [ready, setReady] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const latest = useRef(props);
  latest.current = props;

  const api = () => (ready > 0 ? (frame.current?.contentWindow?.previewApi ?? null) : null);
  useImperativeHandle(ref, () => ({ api }));

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.type !== READY_MESSAGE) return;
      const preview = frame.current?.contentWindow?.previewApi;
      if (!preview) return;
      preview.onStatus((s) => latest.current.onStatus(s));
      preview.onScroll(() => latest.current.onScroll());
      setReady((n) => n + 1);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const preview = api();
    if (preview && payload) preview.render(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, payload]);

  useEffect(() => {
    api()?.setAnimating(props.animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, props.animate]);

  useEffect(() => {
    api()?.setTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, theme]);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Desktop renders 1280px wide and is scaled down to fit; mobile is a 390px column.
  let frameStyle: React.CSSProperties = { width: "100%", height: "100%" };
  if (width === "desktop" && stageSize.width) {
    const scale = Math.min(1, stageSize.width / DESKTOP);
    frameStyle = { width: DESKTOP, height: stageSize.height / scale, transform: `scale(${scale})`, transformOrigin: "0 0" };
  } else if (width === "mobile") {
    frameStyle = { width: MOBILE, height: "100%" };
  }

  return (
    <section className="preview-pane">
      <div className="pane-bar">
        <span className="pane-title mono">Preview</span>
        <PreviewStatusBadge status={status} />
        <div className="pane-tools">
          <div className="mini-seg" role="radiogroup" aria-label="Largura">
            <button type="button" role="radio" aria-checked={width === "fluid"} onClick={() => props.onWidth("fluid")} title="Largura do painel">
              <MoveHorizontal size={13} />
            </button>
            <button type="button" role="radio" aria-checked={width === "desktop"} onClick={() => props.onWidth("desktop")} title={`Desktop (${DESKTOP}px, reduzido)`}>
              <Monitor size={13} />
            </button>
            <button type="button" role="radio" aria-checked={width === "mobile"} onClick={() => props.onWidth("mobile")} title={`Celular (${MOBILE}px)`}>
              <Smartphone size={13} />
            </button>
          </div>
          <div className="mini-seg" role="radiogroup" aria-label="Tema do preview">
            <button type="button" role="radio" aria-checked={theme === "light"} onClick={() => props.onTheme("light")} title="Tema claro">
              <Sun size={13} />
            </button>
            <button type="button" role="radio" aria-checked={theme === "dark"} onClick={() => props.onTheme("dark")} title="Tema escuro">
              <Moon size={13} />
            </button>
          </div>
        </div>
      </div>
      {status.state === "error" && (
        <button type="button" className="compile-error" onClick={props.onGotoError} title="Ir para a linha">
          <AlertTriangle size={14} />
          <span className="mono">{props.errorLine != null ? `Linha ${props.errorLine}${status.error.column ? `:${status.error.column}` : ""}` : "MDX"}</span>
          <span className="message">{status.error.message}</span>
        </button>
      )}
      <div className="preview-stage" ref={stage} data-width={width} data-theme={theme}>
        <iframe ref={frame} src="/preview.html" title="Preview do artigo" style={frameStyle} />
      </div>
    </section>
  );
});

function PreviewStatusBadge({ status }: { status: PreviewStatus }) {
  if (status.state === "compiling") return <span className="pane-status mono">compilando…</span>;
  if (status.state === "error") return <span className="pane-status mono" data-error>erro no MDX</span>;
  return null;
}
