import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getEntryBySlug,
  listEntries,
  slugToPath,
  type ContentEntry,
} from '@/lib/content'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export async function generateStaticParams() {
  const entries = await listEntries()
  return entries.map((entry) => ({
    slug: entry.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const entry = await getEntryBySlug(slug)
  if (!entry) return {}

  const path = slugToPath(entry.slug)
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    alternates: { canonical: path },
    openGraph: {
      title: entry.frontmatter.title,
      description: entry.frontmatter.summary,
      url: path,
      type: entry.frontmatter.type === 'post' ? 'article' : 'website',
    },
  }
}

export default async function ContentPage({ params }: PageProps) {
  const { slug = [] } = await params
  const entry = await getEntryBySlug(slug)
  if (!entry) notFound()

  const entries = slug.length === 0 ? await listEntries() : []
  const recent = entries
    .filter((item) => item.slug.length > 0)
    .sort(sortByDate)
    .slice(0, 8)

  return (
    <article className="article">
      <p className="eyebrow">{formatMeta(entry)}</p>
      <h1>{entry.frontmatter.title}</h1>
      {entry.frontmatter.summary && (
        <p className="summary">{entry.frontmatter.summary}</p>
      )}
      <div className="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.body}</ReactMarkdown>
      </div>
      {recent.length > 0 && (
        <section className="entry-list" aria-label="Recent pages">
          {recent.map((item) => (
            <div className="entry" key={slugToPath(item.slug)}>
              <a href={slugToPath(item.slug)}>{item.frontmatter.title}</a>
              {item.frontmatter.summary && <p>{item.frontmatter.summary}</p>}
            </div>
          ))}
        </section>
      )}
    </article>
  )
}

function sortByDate(a: ContentEntry, b: ContentEntry): number {
  return (
    (b.frontmatter.date?.getTime() ?? 0) -
    (a.frontmatter.date?.getTime() ?? 0)
  )
}

function formatMeta(entry: ContentEntry): string {
  const parts = []
  if (entry.frontmatter.type) parts.push(entry.frontmatter.type)
  if (entry.frontmatter.date) {
    parts.push(
      entry.frontmatter.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    )
  }
  return parts.join(' / ')
}
