//! Git, narrowly. The interface plans what to run (`src/lib/git.ts`); this
//! side only runs it, and refuses anything outside what Caderno needs: the
//! repository is shared with other people and agents, so nothing that touches
//! files it doesn't own (`stash`, `reset`, `checkout`, `add -A`/`.`), nothing
//! that rewrites the remote (`push --force`), and paths only under the posts
//! and their images.
//!
//! `../../dev-bridge.ts` applies the same rules; keep both in step.

use std::{
    path::Path,
    process::{Command, Stdio},
};

use serde::Serialize;

#[derive(Serialize)]
pub struct GitOutput {
    pub code: i32,
    pub stdout: String,
    pub stderr: String,
}

const PATH_PREFIXES: [&str; 2] = ["src/content/", "public/blog/"];

/// Checks one invocation against the rules above. `Err` explains the refusal.
pub fn check(args: &[String]) -> Result<(), String> {
    let refuse = |why: &str| Err(format!("Comando git recusado ({why}): git {}", args.join(" ")));
    let Some(sub) = args.first().map(String::as_str) else { return refuse("vazio") };
    let has = |flag: &str| args.iter().any(|a| a == flag);
    let separator = args.iter().position(|a| a == "--");
    let paths: &[String] = separator.map(|i| &args[i + 1..]).unwrap_or(&[]);

    // Every path must be a plain path under the posts or their images.
    for path in paths {
        let plain = !path.is_empty()
            && !path.starts_with('/')
            && !path.starts_with(':')
            && !path.contains('*')
            && Path::new(path).components().all(|c| matches!(c, std::path::Component::Normal(_)));
        if !plain || !PATH_PREFIXES.iter().any(|p| path.starts_with(p) || format!("{path}/") == *p) {
            return refuse(&format!("caminho fora dos posts: {path}"));
        }
    }
    let options = &args[1..separator.unwrap_or(args.len())];

    match sub {
        "status" | "log" | "diff" | "ls-files" | "rev-parse" | "rev-list" | "fetch" => {
            if sub == "fetch" && (has("--prune") || options.iter().any(|a| a.contains(':'))) {
                return refuse("fetch só simples");
            }
            Ok(())
        }
        "add" | "commit" | "mv" | "rm" => {
            if separator.is_none() || paths.is_empty() {
                return refuse("sem caminhos explícitos após --");
            }
            let forbidden = ["-A", "--all", "-a", "-u", "--update", "--amend", "-f", "--force", "-r"];
            if options.iter().any(|a| forbidden.contains(&a.as_str())) {
                return refuse("opção não permitida");
            }
            if sub == "commit" && !options.iter().all(|a| a == "-m" || !a.starts_with('-')) {
                return refuse("commit só com -m");
            }
            if sub == "rm" && !has("--cached") {
                return refuse("rm só com --cached");
            }
            Ok(())
        }
        "pull" => {
            if has("--rebase") && options.len() == 1 {
                Ok(())
            } else {
                refuse("pull só com --rebase")
            }
        }
        "rebase" => {
            if options == ["--abort"] {
                Ok(())
            } else {
                refuse("rebase só --abort")
            }
        }
        "push" => {
            if options.iter().any(|a| a.starts_with('-') || a.starts_with('+') || a.contains(':')) {
                return refuse("push só simples");
            }
            Ok(())
        }
        _ => refuse("subcomando não permitido"),
    }
}

/// Runs git in `repo`. Never prompts: an interactive login would hang the app.
pub fn run(repo: &Path, args: &[String]) -> Result<GitOutput, String> {
    check(args)?;
    let output = Command::new("git")
        .current_dir(repo)
        .args(["-c", "core.quotepath=off", "-c", "color.ui=false"])
        .args(args)
        .env("GIT_TERMINAL_PROMPT", "0")
        .env("GIT_SSH_COMMAND", std::env::var("GIT_SSH_COMMAND").unwrap_or_else(|_| "ssh -o BatchMode=yes".into()))
        .env("LC_ALL", "C")
        .stdin(Stdio::null())
        .output()
        .map_err(|e| format!("Não foi possível rodar o git ({e}). Ele está instalado?"))?;
    Ok(GitOutput {
        code: output.status.code().unwrap_or(-1),
        stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
        stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
    })
}

#[cfg(test)]
mod tests {
    use super::check;

    fn ok(args: &[&str]) -> bool {
        check(&args.iter().map(|s| s.to_string()).collect::<Vec<_>>()).is_ok()
    }

    #[test]
    fn allows_what_caderno_needs() {
        assert!(ok(&["status", "--porcelain=v1", "-z", "-b", "--", "src/content", "public/blog"]));
        assert!(ok(&["add", "--", "src/content/engineering/pt/a.mdx", "public/blog/engineering/a-1.webp"]));
        assert!(ok(&["commit", "-m", "Publica “A”", "--", "src/content/engineering/pt/a.mdx"]));
        assert!(ok(&["mv", "--", "src/content/engineering/pt/a.mdx", "src/content/_archive/engineering/pt/a.mdx"]));
        assert!(ok(&["pull", "--rebase"]));
        assert!(ok(&["push"]));
        assert!(ok(&["rebase", "--abort"]));
        assert!(ok(&["fetch"]));
    }

    #[test]
    fn refuses_the_rest() {
        assert!(!ok(&["stash"]));
        assert!(!ok(&["reset", "--hard"]));
        assert!(!ok(&["checkout", "--", "."]));
        assert!(!ok(&["add", "-A"]));
        assert!(!ok(&["add", "--", "."]));
        assert!(!ok(&["add", "--", "src/app/page.tsx"]));
        assert!(!ok(&["add", "--", "src/content/../../x"]));
        assert!(!ok(&["commit", "-am", "x", "--", "src/content/a.mdx"]));
        assert!(!ok(&["commit", "--amend", "-m", "x", "--", "src/content/a.mdx"]));
        assert!(!ok(&["commit", "-m", "x"]));
        assert!(!ok(&["push", "--force"]));
        assert!(!ok(&["push", "origin", "+main"]));
        assert!(!ok(&["pull"]));
        assert!(!ok(&["rebase", "main"]));
        assert!(!ok(&["rm", "--", "src/content/a.mdx"]));
    }
}
