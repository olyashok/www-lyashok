# www-lyashok

Personal website for lyashok.com. Public repo: `olyashok/www-lyashok`.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Content

Routes are backed by markdown files at `content/<route>/index.md`.

Examples:

```text
content/index.md                  -> /
content/resume/index.md           -> /resume
content/blog/example/index.md     -> /blog/example
content/notes/tools/index.md      -> /notes/tools
```

Frontmatter:

```yaml
---
title: "Title"
date: 2026-06-30
summary: "Short description"
type: post
tags: ["tag"]
draft: false
---
```

Drafts are hidden in production.

## Analytics

GA4 is loaded only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. Analytics cookies are gated behind the in-repo Klaro consent banner copied from the Shape site pattern.
