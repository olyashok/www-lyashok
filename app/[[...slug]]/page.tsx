import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
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
      publishedTime:
        entry.frontmatter.type === 'post'
          ? entry.frontmatter.date?.toISOString()
          : undefined,
      authors:
        entry.frontmatter.type === 'post'
          ? ['https://lyashok.com/about']
          : undefined,
      tags: entry.frontmatter.tags,
      images: entry.frontmatter.image ? [entry.frontmatter.image] : undefined,
    },
    twitter: {
      card: entry.frontmatter.image ? 'summary_large_image' : 'summary',
      title: entry.frontmatter.title,
      description: entry.frontmatter.summary,
      images: entry.frontmatter.image ? [entry.frontmatter.image] : undefined,
    },
  }
}

export default async function ContentPage({ params }: PageProps) {
  const { slug = [] } = await params
  if (slug.length === 1 && slug[0] === 'resume') {
    redirect('https://www.linkedin.com/in/lyashok/')
  }

  const entry = await getEntryBySlug(slug)
  if (!entry) notFound()

  const entries = slug.length === 0 || isBlogIndex(slug) ? await listEntries() : []
  const listedEntries = entries
    .filter((item) =>
      isBlogIndex(slug)
        ? item.slug[0] === 'blog' && item.slug.length > 1
        : item.slug.length > 0 && !isHiddenFromHome(item),
    )
    .sort(sortByDate)
  const recent = isBlogIndex(slug) ? listedEntries : listedEntries.slice(0, 8)

  return (
    <article className="article">
      {formatMeta(entry) && <p className="eyebrow">{formatMeta(entry)}</p>}
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

function isHiddenFromHome(entry: ContentEntry): boolean {
  const path = slugToPath(entry.slug)
  return path === '/privacy' || path === '/resume'
}

function isBlogIndex(slug: string[]): boolean {
  return slug.length === 1 && slug[0] === 'blog'
}

function sortByDate(a: ContentEntry, b: ContentEntry): number {
  return (
    (b.frontmatter.date?.getTime() ?? 0) -
    (a.frontmatter.date?.getTime() ?? 0)
  )
}

function formatMeta(entry: ContentEntry): string {
  if (entry.frontmatter.type === 'page') return ''

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
