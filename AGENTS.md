<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Blogs (engineering and reflections)

- Routes: `src/app/[lang]/engineering/` and `src/app/[lang]/reflections/`. Posts: `src/content/<blog>/<pt|en>/<slug>.mdx` (see `src/content/BLOG.md`).
- Shared foundation (don't change while working on one blog; ask first): `src/lib/blog/`, `src/components/blog/`, `src/mdx-components.tsx`, `next.config.ts`, `package.json`, `package-lock.json`, `src/app/[lang]/layout.tsx`, `src/app/globals.css`, `src/i18n/`.
- Each blog owns everything inside its route folder (layout, pages, `_components/`, `_strings.ts`, `blog.module.css`), its content folder and `public/blog/<blog>/`. Agents working on different blogs in parallel touch only their own blog's files.
- Same checkout, shared branch: never run `git stash`, `git add -A`/`git add .`, `git reset`, `git checkout -- .` or `npm install`. Commit only your own paths (`git commit -- <paths>`). When running `npx tsc --noEmit`, judge only errors in your own files. Reuse the `next dev` server that is already running.
