import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { api, errorMessage, inTauri, pickFolder } from "../lib/api";

/** First run: where the portfolio repository is. */
export function Setup({ suggested, onDone }: { suggested: string | null; onDone: (repo: string) => void }) {
  const [path, setPath] = useState(suggested ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = async (value = path) => {
    setBusy(true);
    setError(null);
    try {
      onDone(await api.setRepo(value.trim()));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="setup">
      <div className="setup-card">
        <p className="setup-kicker mono">Primeira execução</p>
        <h1 className="setup-title">Caderno</h1>
        <p className="setup-text">Onde está o repositório do portfólio? É a pasta que tem <code>src/content/</code> com os posts dos blogs.</p>
        <form
          className="setup-form"
          onSubmit={(e) => {
            e.preventDefault();
            confirm();
          }}
        >
          <div className="setup-path">
            <input className="input mono" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/home/…/portfolio-dev" spellCheck={false} />
            {inTauri && (
              <button
                type="button"
                className="button ghost"
                onClick={async () => {
                  const chosen = await pickFolder(path || undefined);
                  if (chosen) {
                    setPath(chosen);
                    confirm(chosen);
                  }
                }}
              >
                <FolderOpen size={14} /> Escolher…
              </button>
            )}
          </div>
          {suggested && <p className="hint">Sugestão: a pasta acima de <code>editor/</code>.</p>}
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="button primary" disabled={!path.trim() || busy}>
            Usar esta pasta
          </button>
        </form>
        <p className="hint">A escolha fica guardada na configuração do usuário; dá para trocar depois.</p>
      </div>
    </div>
  );
}
