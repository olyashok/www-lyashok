---
name: onenote-to-post
description: Convert personal OneNote or OneDrive OneNote links into local lyashok.com content posts/pages. Use when the user sends a OneNote/OneDrive note URL and asks to add, import, publish, convert, or turn it into a post, Curio item, Writing item, or markdown content in this repo.
---

# OneNote To Post

## Workflow

1. Fetch the OneNote page through Microsoft Graph. Prefer the helper:

   ```bash
   node skills/onenote-to-post/scripts/fetch-onenote-page.mjs '<onenote-or-onedrive-url>' --out /tmp/onenote-page
   ```

   The helper reads `GRAPH_ACCESS_TOKEN` or `M365_LG`; if neither is set it tries `/app/fi/.env.local`. Never print tokens.

2. Read `/tmp/onenote-page/manifest.json` and `/tmp/onenote-page/page.html`. Inspect downloaded images when needed with `view_image`.
   Resources may include images and file attachments such as PDFs.

3. Choose the destination:
   - `content/curio/<slug>/index.md` for notes, lists, diagrams, visualizations, reading notes, small observations, or anything exploratory.
   - `content/blog/<slug>/index.md` for essay-like public articles.
   - Use existing categories unless the user requests a new one. Current Writing categories are `AI` for blog posts and `Curio` for `content/curio`.

4. Create colocated content:
   - Put all note-owned media and useful attachments next to `index.md`.
   - Use relative references like `./cover.png` or `./inline-01.jpg`.
   - Link attachments with reader-facing labels, for example `[Download the original PDF](./order-status.pdf)`.
   - Do not link to OneNote or OneDrive from the final public page.

5. Validate locally, run checks, commit, push, and verify production.

## Frontmatter

Use this shape:

```yaml
---
title: "User-facing title"
summary: "Short reader-facing sentence."
date: "YYYY-MM-DD"
type: page
image: "./thumb.png"
tags:
  - curio
---
```

Rules:
- Use `type: page` for Curio and `type: post` for blog essays.
- Use the OneNote `createdDateTime` date unless the content clearly has its own publication date.
- Omit `image` only when there is no useful image.
- Keep tags sparse and useful, for example `curio`, `visualization`, `ai`, `automation`, `finance`, `software`.

## Summary Style

Write summaries for people browsing the site. They should read like plain, compact X posts without clickbait, cleverness, or marketing.

Good:
- `Order status logic becomes complex very quickly.`
- `Some words carry context that does not translate cleanly into English.`
- `Automation looks simple until the edge cases become the work.`

Avoid:
- `A visualization note on how quickly order status logic becomes complex.`
- `This post explores...`
- `A deep dive into...`
- `What you need to know about...`
- Puns, hype, teaser phrasing, or rhetorical questions.

## Thumbnail Choice

Choose the image that tells a reader what the post is:
- Prefer the first large original diagram, chart, screenshot, or meaningful illustration.
- For image-only notes, use that image as both body image and `image`.
- Avoid profile photos, company logos, social avatars, and decorative images unless the content is specifically about them.
- If there is no useful image, omit `image`; the site will show rotating placeholders.
- If multiple images are useful, keep them all in the body and choose the most representative one for `image`.
- Do not use a PDF or other document file as `image`. Use an image preview only when one already exists or you intentionally generate a thumbnail.

## Attachments

OneNote notes may include PDFs or other attached files. Treat them as post assets when they help the reader.

- Keep useful attachments colocated with the markdown and rename them to readable filenames.
- Link PDFs and documents from the body instead of embedding OneNote or OneDrive URLs.
- If an attached PDF is the main content, create a short page with a plain summary and a clear PDF link.
- Do not make an attachment the thumbnail unless it has a separate image preview.
- Skip temporary, system, duplicate, or unrelated attached files.
- When a PDF contains the substantive content and the note text is sparse, read enough of the PDF to choose the title, category, summary, and tags.

## Body Conversion

- Preserve useful headings, lists, tables, and links.
- Convert embedded resources to markdown image references: `![Meaningful alt](./image-name.png)`.
- Convert useful file attachments to markdown links: `[Readable file label](./file-name.pdf)`.
- For image-only notes, the body can be just the image. Do not add filler text that repeats the summary.
- Clean up OneNote artifacts, empty paragraphs, duplicated titles, and layout-only text.
- Keep titles and summaries user-ready; do not expose technical import details.

## Validation

Before finishing:

```bash
npm run typecheck
npm run lint
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-HRMPX3KW03 npm run build
```

Also verify:
- The new page route renders locally.
- The selected image URL is `/content-assets/...`, not `/media/...`.
- The Writing page shows the card under the correct category.
- Production renders after deploy.
