import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { errorMessage } from "../lib/api";
import { GitError, type Step } from "../lib/git";
import { Modal } from "./Modal";

export type FileRow = { path: string; note: string; tone?: "new" | "removed" | "moved" };

const STEP_TEXT: Record<Step, string> = {
  move: "Movendo os arquivos…",
  trash: "Mandando para a lixeira…",
  commit: "Commitando…",
  fetch: "Consultando o remoto…",
  pull: "Trazendo os commits do remoto (pull --rebase)…",
  push: "Enviando (push)…",
};

type Props = {
  title: string;
  /** Explanation and options, above the files. */
  children?: ReactNode;
  files: FileRow[];
  /** Commit message, when something will be committed. `null`: nothing goes to git. */
  message: string | null;
  onMessage: (message: string) => void;
  warnings?: string[];
  /** Blocks the confirmation (validation errors, nothing to do). */
  blocked?: string[];
  confirmLabel: string;
  danger?: boolean;
  run: (progress: (step: Step) => void) => Promise<void>;
  onClose: () => void;
};

/**
 * Every git action goes through one of these: what will change, the commit
 * message, then progress and, on failure, the readable reason with git's own
 * output underneath.
 */
export function GitActionDialog({ title, children, files, message, onMessage, warnings = [], blocked = [], confirmLabel, danger, run, onClose }: Props) {
  const [step, setStep] = useState<Step | null>(null);
  const [failure, setFailure] = useState<{ message: string; detail: string } | null>(null);
  const running = step != null && !failure;

  const go = async () => {
    setFailure(null);
    setStep("commit");
    try {
      await run(setStep);
    } catch (error) {
      setFailure(error instanceof GitError ? { message: error.message, detail: error.detail } : { message: errorMessage(error), detail: "" });
    }
  };

  return (
    <Modal title={title} onClose={running ? () => {} : onClose} width={540}>
      <div className="form git-dialog">
        {children}

        {files.length > 0 && (
          <div className="field">
            <span className="field-label">Arquivos</span>
            <ul className="file-list mono">
              {files.map((file) => (
                <li key={file.path} data-tone={file.tone}>
                  <span className="file-path" title={file.path}>
                    {file.path}
                  </span>
                  <span className="file-note">{file.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {message != null && (
          <label className="field">
            <span className="field-label">Mensagem do commit</span>
            <input className="input" value={message} onChange={(e) => onMessage(e.target.value)} disabled={running} spellCheck />
          </label>
        )}

        {(warnings.length > 0 || blocked.length > 0) && (
          <ul className="git-notes">
            {blocked.map((text) => (
              <li key={text} data-kind="blocked">
                <AlertTriangle size={13} /> {text}
              </li>
            ))}
            {warnings.map((text) => (
              <li key={text}>
                <AlertTriangle size={13} /> {text}
              </li>
            ))}
          </ul>
        )}

        {failure ? (
          <div className="git-failure">
            <p>{failure.message}</p>
            {failure.detail && (
              <details>
                <summary className="mono">Saída do git</summary>
                <pre className="mono">{failure.detail}</pre>
              </details>
            )}
          </div>
        ) : (
          running && (
            <p className="git-progress mono">
              <Loader2 size={13} className="spin" /> {STEP_TEXT[step]}
            </p>
          )
        )}

        <div className="modal-actions">
          <button type="button" className="button ghost" onClick={onClose} disabled={running}>
            {failure ? "Fechar" : "Cancelar"}
          </button>
          <button
            type="button"
            className={`button primary${danger ? " danger" : ""}`}
            onClick={go}
            disabled={running || blocked.length > 0 || (message != null && !message.trim())}
            data-primary
          >
            {running ? <Loader2 size={13} className="spin" /> : failure ? null : <Check size={13} />}
            {failure ? "Tentar de novo" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
