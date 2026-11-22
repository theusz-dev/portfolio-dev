import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

/**
 * Development only: answers the app's backend commands over HTTP
 * (`POST /__bridge/<command>`) so the interface also runs in a plain browser
 * with `npm run dev`. The desktop app uses the Rust commands in
 * src-tauri/src/lib.rs instead; both must behave the same.
 */

const collections = ["engineering", "reflections"];
const langs = ["pt", "en"];
const IMAGE_EXT = /^(png|jpe?g|webp|gif|avif|svg)$/;
const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/** Same rules as src-tauri/src/git.rs `check`. */
export function checkGit(args: string[]): string | null {
  const refuse = (why: string) => `Comando git recusado (${why}): git ${args.join(" ")}`;
  const [sub] = args;
  if (!sub) return refuse("vazio");
  const has = (flag: string) => args.includes(flag);
  const sep = args.indexOf("--");
  const paths = sep >= 0 ? args.slice(sep + 1) : [];
  for (const p of paths) {
    const plain = p !== "" && !p.startsWith("/") && !p.startsWith(":") && !p.includes("*") && p.split("/").every((c) => c !== "" && c !== "." && c !== "..");
    if (!plain || !["src/content/", "public/blog/"].some((prefix) => p.startsWith(prefix) || `${p}/` === prefix)) return refuse(`caminho fora dos posts: ${p}`);
  }
  const options = args.slice(1, sep >= 0 ? sep : args.length);
  switch (sub) {
    case "status":
    case "log":
    case "diff":
    case "ls-files":
    case "rev-parse":
    case "rev-list":
      return null;
    case "fetch":
      return has("--prune") || options.some((a) => a.includes(":")) ? refuse("fetch só simples") : null;
    case "add":
    case "commit":
    case "mv":
    case "rm":
      if (sep < 0 || paths.length === 0) return refuse("sem caminhos explícitos após --");
      if (options.some((a) => ["-A", "--all", "-a", "-u", "--update", "--amend", "-f", "--force", "-r"].includes(a))) return refuse("opção não permitida");
      if (sub === "commit" && !options.every((a) => a === "-m" || !a.startsWith("-"))) return refuse("commit só com -m");
      if (sub === "rm" && !has("--cached")) return refuse("rm só com --cached");
      return null;
    case "pull":
      return has("--rebase") && options.length === 1 ? null : refuse("pull só com --rebase");
    case "rebase":
      return options.length === 1 && options[0] === "--abort" ? null : refuse("rebase só --abort");
    case "push":
      return options.some((a) => a.startsWith("-") || a.startsWith("+") || a.includes(":")) ? refuse("push só simples") : null;
    default:
      return refuse("subcomando não permitido");
  }
}

export function devBridge(repo: string): Plugin {
  /** Repository-relative post path → absolute, refusing anything outside src/content/. */
  const contentFile = (relative: string) => {
    const normal = path.posix.normalize(relative.replace(/\\/g, "/"));
    if (normal.startsWith("..") || path.posix.isAbsolute(normal) || !normal.startsWith("src/content/") || !normal.endsWith(".mdx")) {
      throw new Error(`Caminho de post inválido: ${relative}`);
    }
    return path.join(repo, normal);
  };

  const listPosts = () => {
    const posts = [];
    for (const archived of [false, true]) {
      for (const collection of collections) {
        for (const lang of langs) {
          const rel = archived ? `src/content/_archive/${collection}/${lang}` : `src/content/${collection}/${lang}`;
          const dir = path.join(repo, rel);
          if (!fs.existsSync(dir)) continue;
          for (const file of fs.readdirSync(dir)) {
            if (!file.endsWith(".mdx")) continue;
            const full = path.join(dir, file);
            posts.push({
              collection,
              lang,
              slug: file.slice(0, -4),
              archived,
              path: `${rel}/${file}`,
              source: fs.readFileSync(full, "utf8"),
              modified: fs.statSync(full).mtimeMs,
            });
          }
        }
      }
    }
    return posts;
  };

  const imageName = (collection: string, slug: string, ext: string) => {
    if (!collections.includes(collection)) throw new Error("Blog inválido.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Defina um slug válido antes de inserir imagens.");
    const extension = ext.toLowerCase().replace(/^jpeg$/, "jpg");
    if (!IMAGE_EXT.test(extension)) throw new Error(`Formato de imagem não suportado: ${ext}`);
    const dir = path.join(repo, "public", "blog", collection);
    fs.mkdirSync(dir, { recursive: true });
    for (let n = 1; ; n++) {
      const name = `${slug}-${n}.${extension}`;
      if (!fs.existsSync(path.join(dir, name))) return { full: path.join(dir, name), site: `/blog/${collection}/${name}` };
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commands: Record<string, (args: any) => unknown> = {
    get_config: () => ({ repo, suggested: repo }),
    set_repo: () => repo,
    list_posts: listPosts,
    read_post: ({ path: p }) => fs.readFileSync(contentFile(p), "utf8"),
    write_post: ({ path: p, source }) => {
      const file = contentFile(p);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const temp = `${file}.tmp-${process.pid}`;
      fs.writeFileSync(temp, source);
      fs.renameSync(temp, file);
      return null;
    },
    create_post: ({ path: p, source }) => {
      const file = contentFile(p);
      if (fs.existsSync(file)) throw new Error(`Já existe: ${p}`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, source, { flag: "wx" });
      return null;
    },
    move_post: ({ from, to }) => {
      const source = contentFile(from);
      const target = contentFile(to);
      if (fs.existsSync(target)) throw new Error(`Já existe: ${to}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.renameSync(source, target);
      return null;
    },
    git: ({ args }: { args: string[] }) => {
      const refused = checkGit(args);
      if (refused) throw new Error(refused);
      return new Promise((resolve, reject) => {
        const child = spawn("git", ["-c", "core.quotepath=off", "-c", "color.ui=false", ...args], {
          cwd: repo,
          stdio: ["ignore", "pipe", "pipe"],
          env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_SSH_COMMAND: process.env.GIT_SSH_COMMAND ?? "ssh -o BatchMode=yes", LC_ALL: "C" },
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (d) => (stdout += d));
        child.stderr.on("data", (d) => (stderr += d));
        child.on("error", reject);
        child.on("close", (code) => resolve({ code: code ?? -1, stdout, stderr }));
      });
    },
    trash_files: ({ paths }: { paths: string[] }) => {
      for (const p of paths) {
        const file = p.startsWith("public/blog/")
          ? (() => {
              const parts = p.split("/");
              if (parts.length !== 4 || !collections.includes(parts[2]) || parts[3].startsWith(".") || !IMAGE_EXT.test(path.extname(p).slice(1).toLowerCase())) {
                throw new Error(`Caminho de imagem inválido: ${p}`);
              }
              return path.join(repo, p);
            })()
          : contentFile(p);
        if (!fs.existsSync(file)) continue;
        const result = spawnSync("gio", ["trash", file]);
        if (result.status !== 0) throw new Error(`Não foi possível mandar para a lixeira: ${result.stderr}`);
      }
      return null;
    },
    dev_server_running: () =>
      new Promise<boolean>((resolve) => {
        const socket = net.connect({ host: "127.0.0.1", port: 3000 });
        const done = (ok: boolean) => (socket.destroy(), resolve(ok));
        socket.setTimeout(400, () => done(false));
        socket.once("connect", () => done(true));
        socket.once("error", () => done(false));
      }),
  };

  const send = (res: ServerResponse, status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader("content-type", status === 200 ? "application/json" : "text/plain; charset=utf-8");
    res.end(status === 200 ? JSON.stringify(body ?? null) : String(body));
  };

  const readBody = (req: IncomingMessage) =>
    new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });

  return {
    name: "caderno-dev-bridge",
    configureServer(server) {
      server.middlewares.use("/__bridge", async (req, res) => {
        const name = decodeURIComponent((req.url ?? "/").split("?")[0].slice(1));
        try {
          // Files under public/ (post images in the preview).
          if (name.startsWith("public/")) {
            const file = path.join(repo, path.posix.normalize(name));
            if (!file.startsWith(path.join(repo, "public"))) throw new Error("Fora de public/.");
            res.setHeader("content-type", MIME[path.extname(file).slice(1).toLowerCase()] ?? "application/octet-stream");
            res.end(fs.readFileSync(file));
            return;
          }
          if (name === "save_image") {
            const headers = req.headers;
            const { full, site } = imageName(String(headers["x-collection"]), String(headers["x-slug"]), String(headers["x-ext"]));
            fs.writeFileSync(full, await readBody(req));
            return send(res, 200, site);
          }
          const command = commands[name];
          if (!command) return send(res, 404, `Comando desconhecido (ou só no app desktop): ${name}`);
          const raw = await readBody(req);
          const args = raw.length ? JSON.parse(raw.toString("utf8")) : {};
          send(res, 200, await command(args));
        } catch (error) {
          send(res, 500, error instanceof Error ? error.message : String(error));
        }
      });
    },
  };
}
