import { ArrowDown, ArrowUp, GitBranch, RefreshCw } from "lucide-react";
import type { RepoStatus } from "../lib/git";
import type { PreviewStatus } from "../preview/protocol";
import type { Doc, SaveState } from "../state/useDocument";

const SAVE_TEXT: Record<SaveState, string> = {
  saved: "Salvo",
  dirty: "Editando…",
  saving: "Salvando…",
  error: "Erro ao salvar",
};

type Props = {
  doc: Doc | null;
  saveState: SaveState;
  words: number;
  minutes: number;
  cursor: { line: number; column: number };
  status: PreviewStatus;
  errorLine: number | null;
  invalid: boolean;
  repo: string;
  git: RepoStatus | null;
  gitError: string | null;
  fetching: boolean;
  onFetch: () => void;
};

function GitState({ git, gitError, fetching, onFetch }: Pick<Props, "git" | "gitError" | "fetching" | "onFetch">) {
  if (!git) return gitError ? <span className="warn" title={gitError}>git indisponível</span> : null;
  const title = [
    git.upstream ? `${git.branch} → ${git.upstream}` : `${git.branch ?? "sem branch"} (sem upstream)`,
    git.ahead ? `${git.ahead} commit(s) para enviar` : null,
    git.behind ? `${git.behind} commit(s) novos no remoto` : null,
    "Clique para consultar o remoto (git fetch).",
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <button type="button" className="git" onClick={onFetch} title={title} disabled={fetching}>
      {fetching ? <RefreshCw size={11} className="spin" /> : <GitBranch size={11} />}
      {git.branch ?? "HEAD"}
      {git.ahead > 0 && (
        <span className="sync">
          <ArrowUp size={10} />
          {git.ahead}
        </span>
      )}
      {git.behind > 0 && (
        <span className="sync">
          <ArrowDown size={10} />
          {git.behind}
        </span>
      )}
    </button>
  );
}

export function StatusBar({ doc, saveState, words, minutes, cursor, status, errorLine, invalid, repo, ...gitProps }: Props) {
  return (
    <footer className="statusbar mono">
      {doc ? (
        <>
          <span className="save" data-state={saveState}>
            <span className="dot" />
            {SAVE_TEXT[saveState]}
          </span>
          <span>
            {words.toLocaleString("pt-BR")} {words === 1 ? "palavra" : "palavras"} · {minutes} min de leitura
          </span>
          {invalid && <span className="warn">frontmatter incompleto</span>}
          {status.state === "error" && <span className="warn">MDX: erro {errorLine != null ? `na linha ${errorLine}` : "no frontmatter"}</span>}
          <span className="spacer" />
          <GitState {...gitProps} />
          <span>
            Ln {cursor.line}, Col {cursor.column}
          </span>
          <span className="path" title={`${repo}/${doc.path}`}>
            {doc.path}
          </span>
        </>
      ) : (
        <>
          <span className="spacer" />
          <GitState {...gitProps} />
          <span className="path">{repo}</span>
        </>
      )}
    </footer>
  );
}
