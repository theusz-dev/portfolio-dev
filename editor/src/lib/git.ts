import { api } from "./api";

/**
 * Publishing, archiving and deleting with git. Plans are built here and run
 * through the backend's `git` command, which only accepts what these flows
 * use (see src-tauri/src/git.rs). Only the post's own paths are ever added or
 * committed (`git commit -- <paths>`): other people and agents work in the
 * same checkout.
 */

export type GitOutput = { code: number; stdout: string; stderr: string };

export class GitError extends Error {
  constructor(
    message: string,
    readonly detail: string,
  ) {
    super(message);
  }
}

async function git(...args: string[]): Promise<GitOutput> {
  return api.git(args);
}

/** Runs git and throws a readable `GitError` when it fails. */
async function must(...args: string[]): Promise<string> {
  const out = await git(...args);
  if (out.code !== 0) throw new GitError(explain(args, out), (out.stderr || out.stdout).trim());
  return out.stdout;
}

/** Git's own words → what to do about it. */
export function explain(args: string[], { stderr, stdout }: GitOutput): string {
  const text = `${stderr}\n${stdout}`;
  const step = args[0];
  if (/Permission denied \(publickey\)|Host key verification failed|could not read Username|Authentication failed|terminal prompts disabled/i.test(text))
    return "O git não conseguiu se autenticar no GitHub sem interação. Confira se a chave SSH está carregada (ssh-add) e se o push funciona no terminal.";
  if (/Could not resolve host|Network is unreachable|Connection timed out|Connection refused|unable to access/i.test(text))
    return "Sem conexão com o remoto. Verifique a internet e tente de novo; o que já foi commitado continua salvo localmente.";
  if (/no upstream|has no upstream branch|no tracking information/i.test(text))
    return "A branch atual não tem um remoto configurado (upstream). Rode “git push -u origin <branch>” uma vez no terminal.";
  if (/rejected|non-fast-forward|fetch first/i.test(text))
    return "O remoto recebeu commits enquanto você publicava. Tente publicar de novo: o Caderno atualiza antes de enviar.";
  if (/CONFLICT|could not apply|Resolve all conflicts/i.test(text))
    return "Os commits do remoto entram em conflito com os seus nesses arquivos. A atualização foi desfeita; resolva no terminal (git pull --rebase).";
  if (/unstaged changes|uncommitted changes|Your local changes|would be overwritten/i.test(text))
    return "Há outras alterações não commitadas no repositório (fora deste post), e o git não atualiza com elas pendentes. Commite ou descarte essas alterações e publique de novo.";
  if (/not under version control|did not match any file/i.test(text)) return "O arquivo não está no git.";
  if (/destination exists/i.test(text)) return "Já existe um arquivo no destino.";
  if (/index\.lock/i.test(text)) return "Outro processo do git está rodando neste repositório. Espere ele terminar e tente de novo.";
  if (/Comando git recusado/.test(text)) return text.trim();
  return `O git falhou em “git ${step}”.`;
}

/* ---------- Status ---------- */

export type FileStatus = "new" | "modified" | "deleted" | "renamed" | "conflict";

export type RepoStatus = {
  branch: string | null;
  upstream: string | null;
  ahead: number;
  behind: number;
  /** Uncommitted changes under the posts and their images, by repository path. */
  files: Map<string, FileStatus>;
  /** Paths changed by local commits not yet pushed. */
  unpushed: Set<string>;
  /** Paths changed by remote commits not yet pulled (as of the last fetch). */
  incoming: Set<string>;
  /** Tracked changes outside the posts (other work in the checkout). */
  othersDirty: string[];
};

const SCOPE = ["src/content", "public/blog"];

function fileStatus(xy: string): FileStatus {
  if (xy === "??" || xy[0] === "A") return "new";
  if (xy.includes("U") || xy === "AA" || xy === "DD") return "conflict";
  if (xy[0] === "R" || xy[1] === "R") return "renamed";
  if (xy.includes("D")) return "deleted";
  return "modified";
}

async function changedIn(range: string): Promise<Set<string>> {
  const out = await git("log", "--name-only", "--format=", range, "--", ...SCOPE);
  return new Set(out.code === 0 ? out.stdout.split("\n").filter(Boolean) : []);
}

export async function status(): Promise<RepoStatus> {
  const out = await must("status", "--porcelain=v1", "-z", "-b", "--untracked-files=all", "--", ...SCOPE);
  const parts = out.split("\0");
  const head = parts[0].startsWith("## ") ? parts.shift()!.slice(3) : "";
  // "main...origin/main [ahead 1, behind 2]" | "main" | "No commits yet on main" | "HEAD (no branch)"
  const match = head.match(/^(.+?)(?:\.\.\.(\S+))?(?: \[(.*)\])?$/);
  const branch = match && !head.startsWith("HEAD (no branch)") ? match[1].replace(/^No commits yet on /, "") : null;
  const upstream = match?.[2] ?? null;
  const ahead = Number(match?.[3]?.match(/ahead (\d+)/)?.[1] ?? 0);
  const behind = Number(match?.[3]?.match(/behind (\d+)/)?.[1] ?? 0);

  const files = new Map<string, FileStatus>();
  for (let i = 0; i < parts.length; i++) {
    const entry = parts[i];
    if (entry.length < 4) continue;
    const xy = entry.slice(0, 2);
    files.set(entry.slice(3), fileStatus(xy));
    if (xy[0] === "R" || xy[0] === "C") {
      // The rename's old path follows; it no longer exists in the worktree.
      files.set(parts[++i], "deleted");
    }
  }

  const [unpushed, incoming, others] = await Promise.all([
    upstream && ahead ? changedIn("@{u}..HEAD") : Promise.resolve(new Set<string>()),
    upstream && behind ? changedIn("HEAD..@{u}") : Promise.resolve(new Set<string>()),
    git("status", "--porcelain=v1", "-z", "--untracked-files=no"),
  ]);
  const othersDirty = others.stdout
    .split("\0")
    .filter((e) => e.length > 3)
    .map((e) => e.slice(3))
    .filter((p) => !SCOPE.some((s) => p.startsWith(`${s}/`)));
  return { branch, upstream, ahead, behind, files, unpushed, incoming, othersDirty };
}

/** Updates what is known about the remote. Quiet: failures (offline) just leave the old numbers. */
export async function fetchRemote() {
  const out = await git("fetch");
  return out.code === 0;
}

/* ---------- Per-post state ---------- */

export type PostGit = {
  /** Never committed. */
  untracked: boolean;
  /** Uncommitted changes (post or its images). */
  changed: boolean;
  /** Committed but not pushed. */
  unpushed: boolean;
  /** The remote has newer commits touching it. */
  incoming: boolean;
};

export function postGit(repo: RepoStatus | null, paths: string[]): PostGit | null {
  if (!repo) return null;
  const [main] = paths;
  return {
    untracked: repo.files.get(main) === "new",
    changed: paths.some((p) => repo.files.has(p)),
    unpushed: paths.some((p) => repo.unpushed.has(p)),
    incoming: paths.some((p) => repo.incoming.has(p)),
  };
}

/** The post's images among the changed files: `<slug>-N.ext`, plus any other `/blog/<collection>/…` it references. */
export function changedImages(repo: RepoStatus, collection: string, slug: string, bodies: string[]): string[] {
  const prefix = `public/blog/${collection}/`;
  const named = new RegExp(`^${slug.replace(/[-]/g, "\\-")}-\\d+\\.[a-z0-9]+$`);
  const referenced = new Set<string>();
  for (const body of bodies) for (const m of body.matchAll(/\/blog\/([a-z]+\/[^\s)"'>]+)/g)) referenced.add(`public/blog/${m[1]}`);
  return [...repo.files.keys()].filter((p) => p.startsWith(prefix) && (named.test(p.slice(prefix.length)) || referenced.has(p))).sort();
}

/* ---------- Flows ---------- */

export type Step = "fetch" | "commit" | "pull" | "push" | "move" | "trash";
export type Progress = (step: Step) => void;

export type CommitPlan = {
  message: string;
  /** Paths to commit (the post, its images, renames' old and new paths). */
  paths: string[];
  /** Of those, the ones to `git add` first (new or edited files; `git mv` and removals are already staged). */
  stage: string[];
};

/**
 * Commits only `paths`, brings in what the remote has (rebasing the commit on
 * top), then pushes. The commit comes first so the post's own changes never
 * block the rebase; if something else does, the commit stays local and the
 * error says why.
 */
export async function commitAndPush(plan: CommitPlan, progress: Progress = () => {}) {
  if (plan.paths.length) {
    progress("commit");
    if (plan.stage.length) await must("add", "--", ...plan.stage);
    const staged = await git("diff", "--cached", "--name-only", "--", ...plan.paths);
    if (staged.stdout.trim()) await must("commit", "-m", plan.message, "--", ...plan.paths);
  }

  progress("fetch");
  const fetched = await git("fetch");
  if (fetched.code !== 0) throw new GitError(explain(["fetch"], fetched), fetched.stderr.trim());

  const repo = await status();
  if (!repo.upstream) throw new GitError(explain(["push"], { code: 1, stdout: "", stderr: "no upstream" }), "");
  if (repo.behind > 0) {
    progress("pull");
    const pulled = await git("pull", "--rebase");
    if (pulled.code !== 0) {
      const text = pulled.stderr + pulled.stdout;
      if (/CONFLICT|could not apply|Resolve all conflicts/i.test(text)) await git("rebase", "--abort");
      throw new GitError(`${explain(["pull"], pulled)} Seu commit ficou só local.`, text.trim());
    }
  }
  const now = repo.behind > 0 ? await status() : repo;
  if (now.ahead > 0) {
    progress("push");
    await must("push");
  }
}

/** Whether git knows the file (it has been committed or staged). */
export async function tracked(path: string) {
  const out = await git("ls-files", "--error-unmatch", "--", path);
  return out.code === 0;
}

/**
 * Moves posts like `git mv`: a plain rename (which creates the destination
 * folders, unlike `git mv`), then the old path leaves the index and the new
 * one enters it, so git records a rename. Files git doesn't know yet are only
 * renamed. Safe to run again after a partial failure: a move already done is
 * skipped. Returns the paths to commit (old and new of the tracked ones).
 */
export async function movePosts(moves: { from: string; to: string }[], progress: Progress = () => {}) {
  progress("move");
  const commit: string[] = [];
  for (const { from, to } of moves) {
    const known = await tracked(from);
    const exists = await api.readPost(from).then(
      () => true,
      () => false,
    );
    if (exists) await api.movePost(from, to);
    if (known) {
      await must("rm", "--cached", "--quiet", "--", from);
      await must("add", "--", to);
      commit.push(from, to);
    } else if (!exists && (await tracked(to))) {
      commit.push(from, to);
    }
  }
  return commit;
}

/** Sends files to the system trash and stages the removal of the tracked ones; returns those (to commit). */
export async function trashPaths(paths: string[], progress: Progress = () => {}) {
  const known = [];
  for (const p of paths) if (await tracked(p)) known.push(p);
  progress("trash");
  await api.trashFiles(paths);
  if (known.length) await must("rm", "--cached", "--quiet", "--", ...known);
  return known;
}

/** Every image of a post on disk (tracked or new): `public/blog/<collection>/<slug>-N.ext`. */
export async function postImages(repo: RepoStatus, collection: string, slug: string): Promise<string[]> {
  const prefix = `public/blog/${collection}/`;
  const named = new RegExp(`^${slug.replace(/-/g, "\\-")}-\\d+\\.[a-z0-9]+$`);
  const out = await git("ls-files", "--", `public/blog/${collection}`);
  const tracked = out.code === 0 ? out.stdout.split("\n").filter(Boolean) : [];
  const all = new Set([...tracked.filter((p) => repo.files.get(p) !== "deleted"), ...[...repo.files].filter(([, s]) => s === "new").map(([p]) => p)]);
  return [...all].filter((p) => p.startsWith(prefix) && named.test(p.slice(prefix.length))).sort();
}
