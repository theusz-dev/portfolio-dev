import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import { parsePost, serializePost, validate, type FieldErrors } from "../lib/frontmatter";
import { api as backend } from "../lib/api";
import { changedImages, commitAndPush, movePosts, postImages, status, trashPaths, type FileStatus, type RepoStatus } from "../lib/git";
import type { PostEntry } from "../lib/library";
import { postPath, type Lang } from "../lib/types";
import type { Doc } from "../state/useDocument";
import { GitActionDialog, type FileRow } from "./GitDialogs";

export type LifecycleKind = "publish" | "sendDraft" | "archive" | "delete";

export type LifecycleContext = {
  doc: Doc;
  /** The same post in the other language, if any. */
  other: PostEntry | null;
  repo: RepoStatus | null;
  gitError: string | null;
  actions: {
    save: () => Promise<void>;
    setMetaNow: (patch: { draft: boolean }) => Promise<void>;
    close: () => Promise<void>;
  };
  /** Re-reads posts and git; resolves with the new post list. */
  reload: () => Promise<PostEntry[]>;
  openPath: (path: string) => Promise<unknown>;
  notify: (kind: "success" | "info" | "error", message: string) => void;
  onClose: () => void;
};

const NOTE: Record<FileStatus, string> = { new: "novo", modified: "alterado", deleted: "removido", renamed: "renomeado", conflict: "em conflito" };
const L = (lang: Lang) => lang.toUpperCase();
const FIELD: Record<keyof FieldErrors, string> = { title: "título", description: "descrição", date: "data", updated: "atualizado", slug: "slug", frontmatter: "frontmatter" };

/** Warnings every git action shares: what else the push carries, what may block the pull. */
function repoWarnings(repo: RepoStatus, ours: string[]) {
  const notes: string[] = [];
  const foreign = [...repo.unpushed].filter((p) => !ours.includes(p));
  if (repo.ahead > 0) {
    notes.push(
      `A branch ${repo.branch} já tem ${repo.ahead} commit(s) local(is) não enviado(s)${foreign.length ? ", inclusive de outros arquivos" : ""}; o push envia todos.`,
    );
  }
  if (repo.behind > 0) {
    notes.push(`O remoto tem ${repo.behind} commit(s) novo(s); eles entram antes do envio (pull --rebase).`);
    if (repo.othersDirty.length)
      notes.push(
        `Há ${repo.othersDirty.length} arquivo(s) alterado(s) fora dos posts (${repo.othersDirty.slice(0, 3).join(", ")}${repo.othersDirty.length > 3 ? "…" : ""}). Com eles pendentes o git não traz o remoto, e o commit fica só local.`,
      );
  }
  return notes;
}

function gitBlocked(ctx: LifecycleContext) {
  if (ctx.repo) return [];
  return [`Git indisponível: ${ctx.gitError ?? "ainda lendo o estado do repositório…"}`];
}

/* ---------- Publish ---------- */

export function PublishDialog(ctx: LifecycleContext) {
  const { doc, other, repo } = ctx;
  const title = doc.meta.title || doc.slug;
  const otherWorth = !!other && !other.meta.draft && !!repo && (repo.files.has(other.path) || repo.unpushed.has(other.path));
  const [withOther, setWithOther] = useState(otherWorth);
  const [message, setMessage] = useState(doc.meta.draft || repo?.files.get(doc.path) === "new" ? `Publica “${title}”` : `Atualiza “${title}”`);

  const versions = useMemo(
    () => [
      { lang: doc.lang, path: doc.path, draft: doc.meta.draft, errors: doc.raw ? { frontmatter: "ilegível" } : validate(doc.meta, doc.slug), problem: doc.problem },
      ...(withOther && other ? [{ lang: other.lang, path: other.path, draft: other.meta.draft, errors: other.problem ? { frontmatter: "ilegível" } : validate(other.meta, other.slug), problem: other.problem }] : []),
    ],
    [doc, other, withOther],
  );
  const images = repo ? changedImages(repo, doc.collection, doc.slug, [doc.body]) : [];
  const paths = [...versions.map((v) => v.path), ...images];

  const files: FileRow[] = [
    ...versions.map((v) => {
      const change = repo?.files.get(v.path);
      const notes = [v.draft ? "rascunho → publicado" : null, change ? NOTE[change] : null, !change && repo?.unpushed.has(v.path) ? "commit local, falta enviar" : null].filter(Boolean);
      return { path: v.path, note: notes.join(" · ") || "sem alterações", tone: change === "new" ? ("new" as const) : undefined };
    }),
    ...images.map((p) => ({ path: p, note: NOTE[repo!.files.get(p)!], tone: repo!.files.get(p) === "new" ? ("new" as const) : undefined })),
  ];

  const blocked = [...gitBlocked(ctx)];
  for (const v of versions) {
    const fields = Object.entries(v.errors) as [keyof FieldErrors, string][];
    if (fields.length) blocked.push(`${L(v.lang)}: corrija ${fields.map(([field, text]) => `${FIELD[field]} (${text.replace(/\.$/, "").toLowerCase()})`).join(", ")}.`);
  }
  const somethingToDo = versions.some((v) => v.draft) || paths.some((p) => repo?.files.has(p) || repo?.unpushed.has(p));
  if (repo && !somethingToDo) blocked.push("Nada para publicar: o post já está no ar, sem alterações.");

  const warnings = repo ? repoWarnings(repo, paths) : [];
  if (other && !withOther && other.meta.draft) warnings.push(`A versão ${L(other.lang)} continua rascunho.`);
  if (withOther && other?.meta.draft) warnings.push(`A versão ${L(other.lang)} também deixa de ser rascunho.`);

  return (
    <GitActionDialog
      title={doc.meta.draft ? "Publicar" : "Publicar alterações"}
      files={files}
      message={message}
      onMessage={setMessage}
      warnings={warnings}
      blocked={blocked}
      confirmLabel="Commitar e enviar"
      onClose={ctx.onClose}
      run={async (progress) => {
        if (doc.meta.draft) await ctx.actions.setMetaNow({ draft: false });
        else await ctx.actions.save();
        if (withOther && other?.meta.draft) {
          const source = await api.readPost(other.path);
          const parsed = parsePost(source);
          if (parsed.problem) throw new Error(`O frontmatter da versão ${L(other.lang)} está ilegível.`);
          await api.writePost(other.path, serializePost({ ...parsed.meta, draft: false }, parsed.body));
        }
        // Images may have changed since the dialog opened; take the current list.
        const now = await status();
        const all = [...versions.map((v) => v.path), ...changedImages(now, doc.collection, doc.slug, [doc.body])];
        await commitAndPush({ message: message.trim(), paths: all, stage: all }, progress);
        await ctx.reload();
        ctx.notify("success", `“${title}” publicado e enviado.`);
        ctx.onClose();
      }}
    >
      <p className="hint">
        Commita só {versions.length > 1 ? "as duas versões" : "este post"} e as imagens dele (<code>git commit -- &lt;arquivos&gt;</code>), traz o remoto e faz push
        {repo?.branch ? (
          <>
            {" "}
            para <strong className="mono">{repo.upstream ?? repo.branch}</strong>
          </>
        ) : null}
        .
      </p>
      {other && (
        <label className="check">
          <input type="checkbox" checked={withOther} onChange={(e) => setWithOther(e.target.checked)} />
          <span>
            Publicar também a versão {L(other.lang)}
            {other.meta.draft ? " (hoje é rascunho)" : ""}
          </span>
        </label>
      )}
    </GitActionDialog>
  );
}

/* ---------- Send a draft (commit + push, still draft) ---------- */

/** Whether the committed version of `path` is live (not a draft), i.e. pushing a draft takes it off the site. */
async function liveInHead(path: string) {
  const out = await backend.git(["diff", "HEAD", "--", path]);
  return out.code === 0 && /^\+draft: true$/m.test(out.stdout);
}

export function SendDraftDialog(ctx: LifecycleContext) {
  const { doc, repo } = ctx;
  const title = doc.meta.title || doc.slug;
  const [message, setMessage] = useState(`Rascunho “${title}”`);
  const [unpublishes, setUnpublishes] = useState(false);
  useEffect(() => {
    void liveInHead(doc.path).then(setUnpublishes);
  }, [doc.path]);

  const images = repo ? changedImages(repo, doc.collection, doc.slug, [doc.body]) : [];
  const paths = [doc.path, ...images];
  const files: FileRow[] = paths.map((p) => {
    const change = repo?.files.get(p);
    return { path: p, note: change ? NOTE[change] : repo?.unpushed.has(p) ? "commit local, falta enviar" : "sem alterações", tone: change === "new" ? ("new" as const) : undefined };
  });

  const blocked = [...gitBlocked(ctx)];
  const errors = doc.raw ? { frontmatter: "ilegível" } : validate(doc.meta, doc.slug);
  const fields = Object.entries(errors) as [keyof FieldErrors, string][];
  if (fields.length)
    blocked.push(`Corrija ${fields.map(([field, text]) => `${FIELD[field]} (${text.replace(/\.$/, "").toLowerCase()})`).join(", ")}: o site valida até os rascunhos, e a build quebraria.`);
  if (repo && !paths.some((p) => repo.files.has(p) || repo.unpushed.has(p))) blocked.push("Nada para enviar: o rascunho já está no remoto, sem alterações.");

  const warnings = repo ? repoWarnings(repo, paths) : [];
  if (unpublishes) warnings.unshift("No remoto este post está publicado: enviar como rascunho tira ele do site.");

  return (
    <GitActionDialog
      title="Enviar rascunho"
      files={files}
      message={message}
      onMessage={setMessage}
      warnings={warnings}
      blocked={blocked}
      confirmLabel="Commitar e enviar"
      onClose={ctx.onClose}
      run={async (progress) => {
        await ctx.actions.save();
        const now = await status();
        const all = [doc.path, ...changedImages(now, doc.collection, doc.slug, [doc.body])];
        await commitAndPush({ message: message.trim(), paths: all, stage: all }, progress);
        await ctx.reload();
        ctx.notify("success", unpublishes ? `“${title}” voltou a rascunho no remoto e sai do site no próximo deploy.` : `Rascunho “${title}” enviado. Ele continua fora do site.`);
        ctx.onClose();
      }}
    >
      <p className="hint">
        Guarda o texto no GitHub sem publicar: commita só este post e as imagens dele, com <code>draft: true</code>, e faz push. O site deixa rascunhos de fora.
      </p>
    </GitActionDialog>
  );
}

/* ---------- Archive / unarchive ---------- */

export function ArchiveDialog(ctx: LifecycleContext) {
  const { doc, other, repo, actions } = ctx;
  const title = doc.meta.title || doc.slug;
  const archiving = !doc.archived;
  const moves = [doc, ...(other ? [other] : [])].map((v) => ({ from: v.path, to: postPath(v.collection, v.lang, v.slug, archiving), lang: v.lang }));
  const tracked = moves.filter((m) => repo?.files.get(m.from) !== "new");
  const [message, setMessage] = useState(`${archiving ? "Arquiva" : "Desarquiva"} “${title}”`);
  const done = useRef<string[] | null>(null);

  const [clash, setClash] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    Promise.all(moves.map((m) => api.readPost(m.to).then(() => m.to, () => null))).then((found) => alive && setClash(found.filter((p): p is string => !!p)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.path]);

  const warnings = repo && tracked.length ? repoWarnings(repo, moves.flatMap((m) => [m.from, m.to])) : [];
  if (archiving && (doc.meta.draft ? other && !other.meta.draft : true)) warnings.unshift("O post sai do site.");
  if (!archiving) warnings.unshift("O post volta ao site como estava (os que não são rascunho aparecem de novo).");
  if (moves.some((m) => repo?.files.get(m.from) === "modified")) warnings.push("As alterações ainda não commitadas do post vão junto neste commit.");
  const blocked = [...gitBlocked(ctx), ...clash.map((p) => `Já existe ${p}.`)];

  return (
    <GitActionDialog
      title={archiving ? "Arquivar" : "Desarquivar"}
      files={moves.map((m) => ({ path: `${m.from} → ${m.to.replace(/^src\/content\//, "…/")}`, note: repo?.files.get(m.from) === "new" ? "fora do git: só move" : "git mv", tone: "moved" as const }))}
      message={tracked.length ? message : null}
      onMessage={setMessage}
      warnings={warnings}
      blocked={blocked}
      confirmLabel={tracked.length ? (archiving ? "Arquivar e enviar" : "Desarquivar e enviar") : archiving ? "Arquivar" : "Desarquivar"}
      onClose={ctx.onClose}
      run={async (progress) => {
        await actions.save();
        if (!done.current) done.current = await movePosts(moves, progress);
        if (done.current.length) await commitAndPush({ message: message.trim(), paths: done.current, stage: [] }, progress);
        await ctx.reload();
        await ctx.openPath(moves[0].to);
        ctx.notify("success", archiving ? `“${title}” arquivado${moves.length > 1 ? " (as duas versões)" : ""}.` : `“${title}” desarquivado.`);
        ctx.onClose();
      }}
    >
      <p className="hint">
        {archiving ? (
          <>
            Move {moves.length > 1 ? "as duas versões" : "o post"} para <code>src/content/_archive/</code>. Dá para desarquivar depois.
          </>
        ) : (
          <>Move {moves.length > 1 ? "as duas versões" : "o post"} de volta para o blog.</>
        )}
      </p>
    </GitActionDialog>
  );
}

/* ---------- Delete ---------- */

export function DeleteDialog(ctx: LifecycleContext) {
  const { doc, other, repo, actions } = ctx;
  const title = doc.meta.title || doc.slug;
  const [scope, setScope] = useState<"this" | "all">(other ? "this" : "all");
  const [withImages, setWithImages] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [message, setMessage] = useState(`Remove “${title}”`);
  const done = useRef<string[] | null>(null);

  useEffect(() => {
    if (repo) void postImages(repo, doc.collection, doc.slug).then(setImages);
  }, [repo, doc.collection, doc.slug]);

  const posts = scope === "all" && other ? [doc.path, other.path] : [doc.path];
  const wholeArticle = scope === "all" || !other;
  const pictures = wholeArticle && withImages ? images : [];
  const paths = [...posts, ...pictures];
  const tracked = paths.filter((p) => repo?.files.get(p) !== "new");
  const live = !doc.archived && (!doc.meta.draft || (posts.length > 1 && !!other && !other.meta.draft));

  const warnings = ["Os arquivos vão para a lixeira do sistema; dá para recuperá-los de lá."];
  if (live) warnings.unshift("O post sai do site.");
  if (repo && tracked.length) warnings.push(...repoWarnings(repo, paths));

  return (
    <GitActionDialog
      title="Excluir"
      danger
      files={paths.map((p) => ({ path: p, note: repo?.files.get(p) === "new" ? "nunca commitado" : "removido no git", tone: "removed" as const }))}
      message={tracked.length ? message : null}
      onMessage={setMessage}
      warnings={warnings}
      blocked={gitBlocked(ctx)}
      confirmLabel={tracked.length ? "Mandar para a lixeira e enviar" : "Mandar para a lixeira"}
      onClose={ctx.onClose}
      run={async (progress) => {
        if (!done.current) {
          await actions.close();
          done.current = await trashPaths(paths, progress);
        }
        if (done.current.length) await commitAndPush({ message: message.trim(), paths: done.current, stage: [] }, progress);
        const list = await ctx.reload();
        const survivor = list.find((e) => posts.length === 1 && other && e.path === other.path) ?? list.find((e) => !e.archived);
        if (survivor) await ctx.openPath(survivor.path);
        ctx.notify("success", `“${title}” foi para a lixeira.`);
        ctx.onClose();
      }}
    >
      {other && (
        <div className="choice">
          <label className="check">
            <input type="radio" name="scope" checked={scope === "this"} onChange={() => setScope("this")} />
            <span>Só a versão {L(doc.lang)}</span>
          </label>
          <label className="check">
            <input type="radio" name="scope" checked={scope === "all"} onChange={() => setScope("all")} />
            <span>O artigo inteiro ({L(doc.lang)} e {L(other.lang)})</span>
          </label>
        </div>
      )}
      {wholeArticle && images.length > 0 && (
        <label className="check">
          <input type="checkbox" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} />
          <span>
            Também as imagens do post ({images.length})
          </span>
        </label>
      )}
    </GitActionDialog>
  );
}
