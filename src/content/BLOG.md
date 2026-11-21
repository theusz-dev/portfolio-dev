# Writing and publishing a post

Both blogs read Markdown/MDX files from this folder:

```
src/content/engineering/pt/<slug>.mdx   →  /pt/engineering/<slug>
src/content/engineering/en/<slug>.mdx   →  /en/engineering/<slug>
src/content/reflections/pt/<slug>.mdx   →  /pt/reflections/<slug>
src/content/reflections/en/<slug>.mdx   →  /en/reflections/<slug>
```

## 1. Create the file

The file name is the URL (`slug`): lowercase, words joined by `-`, no accents.
A translation uses **the same file name** in the other language folder; that
is what links the two versions (PT / EN switch, `hreflang`). A post can exist
in only one language; the page then says so and hides the switch.

~~~mdx
---
title: "Título do artigo"
description: "Uma ou duas frases. Aparece na lista, no Google e no RSS."
date: 2026-11-21
tags: [nextjs, ia]
draft: true
---

Texto em **Markdown**. Títulos com `##`, listas, tabelas, links, imagens:

![Descrição da imagem](/blog/engineering/minha-imagem.png)

```ts
const código = "com destaque de sintaxe";
```
~~~

| Field | Required | Notes |
|---|---|---|
| `title` | yes | |
| `description` | yes | list pages, `<meta description>`, RSS |
| `date` | yes | `YYYY-MM-DD`; the list is ordered by it, newest first |
| `updated` | no | `YYYY-MM-DD`, shown as "Atualizado em" |
| `tags` | no | `[a, b]` |
| `draft` | no | `true` = visible in `npm run dev` (marked "Rascunho"), left out of the build |

Images go in `public/blog/<engineering|reflections>/` and are referenced from `/blog/...`.
Reading time is calculated automatically.

## 2. Preview

`npm run dev` and open `http://localhost:3000/pt/engineering` (or `/reflections`).
Drafts show up here.

## 3. Publish

Remove `draft: true` (or set it to `false`), commit and push. The deploy
rebuilds the site; the post appears in the list and in the RSS feed
(`/pt/engineering/feed.xml`, `/en/reflections/feed.xml`…).

`npm run build` fails with a clear message if a post is missing `title`,
`description` or a valid `date`.
