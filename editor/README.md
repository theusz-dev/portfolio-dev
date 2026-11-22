# Caderno — editor de artigos

App desktop (Tauri 2 + Vite + React) para escrever os posts dos blogs do portfólio
(`src/content/<blog>/<pt|en>/<slug>.mdx`). Markdown à esquerda, a página do blog à
direita, renderizada com os componentes e as CSS modules do próprio site.

Também publica com git (só os arquivos do post), arquiva, desarquiva e manda para a
lixeira, mostrando o estado do git de cada artigo.

## Rodar em desenvolvimento

Pré-requisitos: Node 20+, Rust (stable, via [rustup](https://rustup.rs)) e as dependências de sistema do Tauri.

**Linux (Debian/Ubuntu):**

```sh
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev libdbus-1-dev pkg-config
```

**macOS:** `xcode-select --install`.

Depois, dentro de `editor/`:

```sh
npm install        # só aqui; nunca na raiz do repositório
npm run app        # = tauri dev: sobe o Vite (porta 1420) e abre a janela
```

Na primeira execução o app pede a pasta do repositório (em dev, sugere a pasta acima
de `editor/`). A escolha fica em `~/.config/dev.theusz.caderno/config.json` (Linux) ou
`~/Library/Application Support/dev.theusz.caderno/config.json` (macOS).

### Só a interface, no navegador

`npm run dev` e abra `http://localhost:1420`. Sem Tauri, os comandos de disco são
atendidos por `dev-bridge.ts` (um middleware do Vite, só em dev, preso ao repositório
acima de `editor/`). Útil para mexer no visual sem compilar Rust.

## Instalar (gerar o instalador)

O instalador é gerado na sua máquina com `npm run bundle` (= `tauri build`), dentro de
`editor/`, com os mesmos pré-requisitos de cima. A primeira build de release leva alguns
minutos.

A versão vem do `package.json` (o Tauri lê de lá, e ela aparece pequena no fim da
barra lateral). Antes de gerar um instalador novo, suba a versão, senão o `apt` acha
que já está instalado:

```sh
npm version patch --no-git-tag-version   # 0.1.1 → 0.1.2 (sem commit nem tag)
```

(e acompanhe o `version` em `src-tauri/Cargo.toml`).

### Linux

```sh
npm run bundle -- --bundles deb,appimage
```

Saem em `src-tauri/target/release/bundle/`:

- **`.deb`** (Debian/Ubuntu/Mint/Pop!_OS): instala o app, o ícone e a entrada
  `Caderno` no menu de aplicativos.

  ```sh
  sudo apt install ./src-tauri/target/release/bundle/deb/Caderno_<versão>_amd64.deb
  ```

  Para desinstalar: `sudo apt remove caderno`.

- **AppImage** (qualquer distribuição): um arquivo só, sem instalar.

  ```sh
  chmod +x Caderno_<versão>_amd64.AppImage && ./Caderno_<versão>_amd64.AppImage
  ```

  Ele não cria entrada no menu sozinho. Use o [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher),
  ou mova o arquivo para `~/Applications/` e crie `~/.local/share/applications/caderno.desktop`:

  ```ini
  [Desktop Entry]
  Type=Application
  Name=Caderno
  Comment=Editor de artigos do portfólio
  Exec=/home/SEU_USUARIO/Applications/Caderno_<versão>_amd64.AppImage
  Icon=/home/SEU_USUARIO/Applications/caderno.png
  Categories=Office;TextEditor;
  ```

  (o ícone está em `src-tauri/icons/128x128@2x.png`).

### macOS

Num clone novo, instale também as dependências do site (`npm install` na raiz): o
preview importa os componentes do blog, e os tipos deles vêm do `node_modules` da raiz.

```sh
npm run bundle -- --bundles app,dmg
# ou, para Intel e Apple Silicon num binário só:
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm run bundle -- --target universal-apple-darwin --bundles app,dmg
```

Abra o `.dmg` em `src-tauri/target/<…>/release/bundle/dmg/` e arraste o Caderno para
Aplicativos; ele aparece no Launchpad e pode ficar no Dock. Como o app não é
assinado pela Apple, na primeira vez abra com clique direito → **Abrir** (ou
`xattr -dr com.apple.quarantine /Applications/Caderno.app`).

### Importante: o preview é embutido na build

O app instalado leva **uma cópia** dos componentes e CSS dos blogs do momento em que foi
gerado (é assim que o preview fica igual ao site). Se o visual do blog mudar
(`src/app/[lang]/<blog>/`, `next.config.ts`), gere e instale de novo. Os posts em si são
sempre lidos do disco, então escrever e publicar não exige rebuild.

### Pela nuvem (opcional): GitHub Actions

`ci/caderno-release.yml` gera o `.deb`, o AppImage e o `.dmg` (universal) no GitHub e
os anexa a um *release* em rascunho. Para usar, copie para a raiz do repositório:

```sh
mkdir -p ../.github/workflows && cp ci/caderno-release.yml ../.github/workflows/
```

Depois publique uma tag `caderno-v0.1.0` (`git tag caderno-v0.1.0 && git push origin caderno-v0.1.0`)
ou rode à mão em **Actions → Caderno release → Run workflow**. Os arquivos aparecem em
**Releases** (rascunho, visível só para você até publicar).

## Git

- **Publicar**: tira o `draft`, valida como o `posts.ts`, commita só o `.mdx` e as
  imagens do post (`git add -- <arquivos>` + `git commit -m … -- <arquivos>`), traz o
  remoto (`git pull --rebase`, se ele estiver à frente) e faz `git push`. O commit vem
  antes do pull porque o git não faz rebase com o próprio post alterado. Se outras
  alterações do repositório impedirem o pull, o commit fica local e o app explica.
- **Arquivar / desarquivar**: move as duas traduções para
  `src/content/_archive/<blog>/<lang>/` (e de volta), registrando a renomeação no git,
  e envia.
- **Excluir**: manda o post (uma versão ou as duas, e as imagens) para a lixeira do
  sistema e commita a remoção.
- Antes de qualquer commit, o app mostra os arquivos e a mensagem.
- O lado nativo só aceita os comandos que esses fluxos usam (`src-tauri/src/git.rs`):
  nada de `stash`, `reset`, `checkout`, `add -A`/`.`, `push --force`, nem caminhos fora
  de `src/content/` e `public/blog/`.
- O git roda sem interação: o push usa a chave SSH do `ssh-agent`. Se ela não estiver
  carregada, o app avisa em vez de travar pedindo senha.

Para experimentar os fluxos sem tocar no GitHub, use um clone descartável com um remoto
local e aponte o modo navegador para ele:

```sh
git clone --bare .. ~/caderno-teste/remote.git && git clone ~/caderno-teste/remote.git ~/caderno-teste/work
CADERNO_REPO=~/caderno-teste/work npx vite --port 1430
```

## Como o preview fica fiel ao site

- `src/preview/compile.ts` compila o MDX com `@mdx-js/mdx` e **os mesmos plugins e
  opções do `next.config.ts`** (remark-frontmatter, remark-gfm, rehype-slug,
  rehype-pretty-code com github-light/github-dark). As versões estão fixadas iguais às
  da raiz. Se o `next.config.ts` mudar, mude aqui também.
- `src/preview/blogs.ts` importa de `src/app/[lang]/<blog>/` (por caminho relativo) o
  `article.module.css`, o `blog.module.css`, o `_components/mdx.tsx`, o `Toc`, o
  `Firmament` e os textos. `next/link` vira um `<a>` (`src/preview/shims/next-link.tsx`)
  e `@/` aponta para o `src/` do site.
- O preview roda num iframe (`preview.html`), então as media queries do blog respondem
  à largura escolhida (painel, desktop 1280px reduzido, celular 390px).
- As fontes do `next/font` são carregadas por `@fontsource` (IBM Plex Sans/Mono,
  Cormorant Garamond) nas mesmas variáveis CSS.

## Atalhos

| | |
|---|---|
| Ctrl/⌘ N | novo artigo |
| Ctrl/⌘ P | buscar na biblioteca |
| Ctrl/⌘ S | salvar agora (o salvamento é automático) |
| Ctrl/⌘ \\ | alternar editor / dividido / preview |
| Ctrl/⌘ Shift F | modo foco |
| Ctrl/⌘ B · I · E · K | negrito · itálico · código · link |
| Ctrl/⌘ Alt 2/3/4 | título H2/H3/H4 |
| Ctrl/⌘ Shift 8 · 7 · 9 | lista · lista numerada · citação |
| Ctrl/⌘ F | buscar no texto |
