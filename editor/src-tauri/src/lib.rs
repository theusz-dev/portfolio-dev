//! Caderno's backend: the few things the webview can't do by itself.
//! Reading and writing posts inside the chosen repository, saving images to
//! `public/blog/<blog>/`, and remembering where the repository is.
//!
//! The same commands exist in `../dev-bridge.ts` for running the UI in a
//! browser; keep both in step.

mod git;

use std::{
    fs,
    net::{SocketAddr, TcpStream},
    path::{Component, Path, PathBuf},
    sync::Mutex,
    time::{Duration, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};
use tauri::{
    ipc::{InvokeBody, Request},
    AppHandle, Manager, State,
};

const COLLECTIONS: [&str; 2] = ["engineering", "reflections"];
const LANGS: [&str; 2] = ["pt", "en"];
const IMAGE_EXTS: [&str; 6] = ["png", "jpg", "webp", "gif", "avif", "svg"];

type Res<T> = Result<T, String>;

struct AppState {
    repo: Mutex<Option<PathBuf>>,
}

/// `<config dir>/dev.theusz.caderno/config.json`
#[derive(Serialize, Deserialize, Default)]
struct ConfigFile {
    repo: Option<String>,
}

#[derive(Serialize)]
struct AppConfig {
    repo: Option<String>,
    suggested: Option<String>,
}

#[derive(Serialize)]
struct RawPost {
    collection: String,
    lang: String,
    slug: String,
    archived: bool,
    /// Relative to the repository, always with `/`.
    path: String,
    source: String,
    modified: f64,
}

/* ---------- Helpers ---------- */

fn config_file(app: &AppHandle) -> Res<PathBuf> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("config.json"))
}

fn looks_like_repo(path: &Path) -> bool {
    path.join("src/content").is_dir() && path.join("src/lib/blog/posts.ts").is_file()
}

/// The folder above `editor/` when this binary was built from the repository.
fn suggested_repo() -> Option<String> {
    let here = Path::new(env!("CARGO_MANIFEST_DIR"));
    let repo = here.parent()?.parent()?;
    looks_like_repo(repo).then(|| repo.to_string_lossy().into_owned())
}

fn repo(state: &State<'_, AppState>) -> Res<PathBuf> {
    state.repo.lock().unwrap().clone().ok_or_else(|| "Nenhum repositório escolhido.".to_string())
}

/// Lets the webview load files under `<repo>/public/` (post images in the preview).
fn allow_public(app: &AppHandle, repo: &Path) {
    let _ = app.asset_protocol_scope().allow_directory(repo.join("public"), true);
}

/// A repository-relative post path, refused unless it is a plain path under `src/content/` ending in `.mdx`.
fn content_file(repo: &Path, relative: &str) -> Res<PathBuf> {
    let path = Path::new(relative);
    let plain = path.components().all(|c| matches!(c, Component::Normal(_)));
    if !plain || !relative.starts_with("src/content/") || !relative.ends_with(".mdx") {
        return Err(format!("Caminho de post inválido: {relative}"));
    }
    Ok(repo.join(path))
}

/// Writes through a temporary file and a rename, so a crash never leaves half a post.
fn write_atomic(file: &Path, bytes: &[u8]) -> Res<()> {
    if let Some(dir) = file.parent() {
        fs::create_dir_all(dir).map_err(|e| format!("{}: {e}", dir.display()))?;
    }
    let temp = file.with_extension(format!("mdx.tmp-{}", std::process::id()));
    fs::write(&temp, bytes).map_err(|e| format!("{}: {e}", temp.display()))?;
    fs::rename(&temp, file).map_err(|e| {
        let _ = fs::remove_file(&temp);
        format!("{}: {e}", file.display())
    })
}

/* ---------- Commands ---------- */

#[tauri::command]
fn get_config(state: State<'_, AppState>) -> AppConfig {
    AppConfig {
        repo: state.repo.lock().unwrap().as_ref().map(|p| p.to_string_lossy().into_owned()),
        suggested: suggested_repo(),
    }
}

#[tauri::command]
fn set_repo(app: AppHandle, state: State<'_, AppState>, path: String) -> Res<String> {
    let chosen = PathBuf::from(path.trim());
    let chosen = chosen.canonicalize().map_err(|_| format!("A pasta não existe: {}", chosen.display()))?;
    if !looks_like_repo(&chosen) {
        return Err("Essa pasta não parece o repositório do portfólio (faltam src/content/ e src/lib/blog/posts.ts).".into());
    }
    let text = serde_json::to_string_pretty(&ConfigFile { repo: Some(chosen.to_string_lossy().into_owned()) }).unwrap();
    let file = config_file(&app)?;
    if let Some(dir) = file.parent() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    fs::write(&file, text).map_err(|e| format!("Não foi possível guardar a configuração: {e}"))?;
    allow_public(&app, &chosen);
    *state.repo.lock().unwrap() = Some(chosen.clone());
    Ok(chosen.to_string_lossy().into_owned())
}

#[tauri::command]
async fn list_posts(state: State<'_, AppState>) -> Res<Vec<RawPost>> {
    let repo = repo(&state)?;
    let mut posts = Vec::new();
    for archived in [false, true] {
        for collection in COLLECTIONS {
            for lang in LANGS {
                let relative = if archived {
                    format!("src/content/_archive/{collection}/{lang}")
                } else {
                    format!("src/content/{collection}/{lang}")
                };
                let Ok(entries) = fs::read_dir(repo.join(&relative)) else { continue };
                for entry in entries.flatten() {
                    let name = entry.file_name().to_string_lossy().into_owned();
                    let Some(slug) = name.strip_suffix(".mdx") else { continue };
                    let source = fs::read_to_string(entry.path()).map_err(|e| format!("{relative}/{name}: {e}"))?;
                    let modified = entry
                        .metadata()
                        .and_then(|m| m.modified())
                        .ok()
                        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                        .map(|d| d.as_millis() as f64)
                        .unwrap_or(0.0);
                    posts.push(RawPost {
                        collection: collection.into(),
                        lang: lang.into(),
                        slug: slug.into(),
                        archived,
                        path: format!("{relative}/{name}"),
                        source,
                        modified,
                    });
                }
            }
        }
    }
    Ok(posts)
}

#[tauri::command]
fn read_post(state: State<'_, AppState>, path: String) -> Res<String> {
    let file = content_file(&repo(&state)?, &path)?;
    fs::read_to_string(&file).map_err(|e| format!("{path}: {e}"))
}

#[tauri::command]
fn write_post(state: State<'_, AppState>, path: String, source: String) -> Res<()> {
    let file = content_file(&repo(&state)?, &path)?;
    write_atomic(&file, source.as_bytes())
}

#[tauri::command]
fn create_post(state: State<'_, AppState>, path: String, source: String) -> Res<()> {
    let file = content_file(&repo(&state)?, &path)?;
    if file.exists() {
        return Err(format!("Já existe: {path}"));
    }
    write_atomic(&file, source.as_bytes())
}

#[tauri::command]
fn move_post(state: State<'_, AppState>, from: String, to: String) -> Res<()> {
    let repo = repo(&state)?;
    let source = content_file(&repo, &from)?;
    let target = content_file(&repo, &to)?;
    if target.exists() {
        return Err(format!("Já existe: {to}"));
    }
    if let Some(dir) = target.parent() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    fs::rename(&source, &target).map_err(|e| format!("{from} → {to}: {e}"))
}

/// Body: the image bytes. Headers: `x-collection`, `x-slug`, `x-ext`.
/// Saves `public/blog/<collection>/<slug>-<n>.<ext>` (first free n) and returns `/blog/<collection>/<name>`.
#[tauri::command]
fn save_image(state: State<'_, AppState>, request: Request<'_>) -> Res<String> {
    let InvokeBody::Raw(bytes) = request.body() else {
        return Err("A imagem deve chegar como bytes.".into());
    };
    let header = |name: &str| {
        request
            .headers()
            .get(name)
            .and_then(|v| v.to_str().ok())
            .map(str::to_string)
            .ok_or_else(|| format!("Falta o cabeçalho {name}."))
    };
    let collection = header("x-collection")?;
    let slug = header("x-slug")?;
    let ext = header("x-ext")?.to_lowercase().replace("jpeg", "jpg");

    if !COLLECTIONS.contains(&collection.as_str()) {
        return Err("Blog inválido.".into());
    }
    let valid_slug = !slug.is_empty()
        && slug.split('-').all(|part| !part.is_empty() && part.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit()));
    if !valid_slug {
        return Err("Defina um slug válido antes de inserir imagens.".into());
    }
    if !IMAGE_EXTS.contains(&ext.as_str()) {
        return Err(format!("Formato de imagem não suportado: {ext}"));
    }

    let dir = repo(&state)?.join("public/blog").join(&collection);
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    for n in 1.. {
        let name = format!("{slug}-{n}.{ext}");
        let file = dir.join(&name);
        // create_new: never overwrite an image another post (or a race) already took.
        match fs::OpenOptions::new().write(true).create_new(true).open(&file) {
            Ok(mut handle) => {
                use std::io::Write;
                handle.write_all(bytes).map_err(|e| e.to_string())?;
                return Ok(format!("/blog/{collection}/{name}"));
            }
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Err(e) => return Err(format!("{}: {e}", file.display())),
        }
    }
    unreachable!()
}

/// Runs one git command in the repository (see `git.rs` for what is allowed).
#[tauri::command]
async fn git(state: State<'_, AppState>, args: Vec<String>) -> Res<git::GitOutput> {
    let repo = repo(&state)?;
    tauri::async_runtime::spawn_blocking(move || git::run(&repo, &args)).await.map_err(|e| e.to_string())?
}

/// Moves posts and post images to the system trash (recoverable), never deletes.
#[tauri::command]
async fn trash_files(state: State<'_, AppState>, paths: Vec<String>) -> Res<()> {
    let repo = repo(&state)?;
    let mut files = Vec::new();
    for relative in &paths {
        let file = if relative.starts_with("public/blog/") {
            let parts: Vec<&str> = relative.split('/').collect();
            let ext = relative.rsplit('.').next().unwrap_or("").to_lowercase();
            let valid = parts.len() == 4 && COLLECTIONS.contains(&parts[2]) && !parts[3].starts_with('.') && IMAGE_EXTS.contains(&ext.as_str());
            if !valid {
                return Err(format!("Caminho de imagem inválido: {relative}"));
            }
            repo.join(relative)
        } else {
            content_file(&repo, relative)?
        };
        if file.exists() {
            files.push(file);
        }
    }
    trash::delete_all(&files).map_err(|e| format!("Não foi possível mandar para a lixeira: {e}"))
}

/// Whether the site's dev server answers on localhost:3000. Never starts it.
#[tauri::command]
async fn dev_server_running() -> bool {
    let address: SocketAddr = "127.0.0.1:3000".parse().unwrap();
    TcpStream::connect_timeout(&address, Duration::from_millis(400)).is_ok()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState { repo: Mutex::new(None) })
        .setup(|app| {
            // The saved repository, if it is still there.
            let handle = app.handle();
            let saved = config_file(handle)
                .ok()
                .and_then(|file| fs::read_to_string(file).ok())
                .and_then(|text| serde_json::from_str::<ConfigFile>(&text).ok())
                .and_then(|config| config.repo)
                .map(PathBuf::from)
                .filter(|path| looks_like_repo(path));
            if let Some(path) = saved {
                allow_public(handle, &path);
                *app.state::<AppState>().repo.lock().unwrap() = Some(path);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_config,
            set_repo,
            list_posts,
            read_post,
            write_post,
            create_post,
            move_post,
            save_image,
            dev_server_running,
            git,
            trash_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running Caderno");
}
