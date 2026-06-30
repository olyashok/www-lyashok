import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

const dateLike = z
  .union([z.date(), z.string().min(1)])
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `not a parseable date: ${String(value)}`,
      })
      return z.NEVER
    }
    return date
  })

const frontmatterSchema = z.object({
  title: z.string().min(1),
  date: dateLike,
  summary: z.string().optional(),
  image: z.string().optional(),
  type: z.enum(['page', 'post', 'note']).default('page'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
})

export type Frontmatter = z.infer<typeof frontmatterSchema>

export interface ContentEntry {
  slug: string[]
  body: string
  frontmatter: Frontmatter
}

export function slugToPath(slug: string[]): string {
  return slug.length === 0 ? '/' : `/${slug.join('/')}`
}

export async function getEntryBySlug(slug: string[]): Promise<ContentEntry | null> {
  const filePath = path.join(CONTENT_ROOT, ...slug, 'index.md')
  try {
    const entry = await readEntry(filePath, slug)
    return isVisible(entry) ? entry : null
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return null
    throw err
  }
}

export async function listEntries(): Promise<ContentEntry[]> {
  const files = await findIndexFiles(CONTENT_ROOT)
  const entries = await Promise.all(
    files.map((file) => readEntry(file, slugFromFile(file))),
  )
  return entries.filter(isVisible)
}

async function findIndexFiles(dir: string): Promise<string[]> {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return []
    throw err
  }

  const files: string[] = []
  const nested: Promise<string[]>[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      nested.push(findIndexFiles(fullPath))
    } else if (entry.isFile() && entry.name === 'index.md') {
      files.push(fullPath)
    }
  }
  const nestedFiles = await Promise.all(nested)
  files.push(...nestedFiles.flat())
  return files
}

async function readEntry(filePath: string, slug: string[]): Promise<ContentEntry> {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = matter(raw)
  const fm = frontmatterSchema.safeParse(parsed.data)
  if (!fm.success) {
    throw new Error(
      `[content] frontmatter parse failed for ${slugToPath(slug)}: ${fm.error.message}`,
    )
  }
  return { slug, body: parsed.content.trim(), frontmatter: fm.data }
}

function slugFromFile(filePath: string): string[] {
  const relative = path.relative(CONTENT_ROOT, path.dirname(filePath))
  return relative === '' ? [] : relative.split(path.sep)
}

function isVisible(entry: ContentEntry): boolean {
  return process.env.NODE_ENV !== 'production' || !entry.frontmatter.draft
}
