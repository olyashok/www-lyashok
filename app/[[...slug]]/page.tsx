import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getEntryBySlug,
  listEntries,
  slugToPath,
  type ContentEntry,
} from '@/lib/content'
import { WritingList, type WritingListItem } from '@/components/writing-list'

const CURIO_WORDS_PATH = '/curio/words-having-no-translation-to-english'

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
  const isHome = entry.slug.length === 0
  return {
    title: isHome
      ? { absolute: entry.frontmatter.title }
      : entry.frontmatter.title,
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

  const isHome = slug.length === 0
  const isWritingIndex = isBlogIndex(slug)
  const isWritingAll = isBlogAll(slug)
  const entries =
    slug.length === 0 || isWritingIndex || isWritingAll ? await listEntries() : []
  const listedEntries = entries
    .filter((item) =>
      isWritingIndex || isWritingAll
        ? isBlogPost(item)
        : item.slug.length > 0 && !isHiddenFromHome(item),
    )
    .sort(sortByDate)
  const recent = isWritingIndex ? listedEntries.slice(0, 5) : listedEntries.slice(0, 8)
  const writingItems = (isWritingIndex || isWritingAll)
    ? listedEntries.map(toWritingListItem)
    : recent.map(toWritingListItem)

  return (
    <article className="article">
      {formatMeta(entry) && <p className="eyebrow">{formatMeta(entry)}</p>}
      {!isHome && <h1>{entry.frontmatter.title}</h1>}
      {entry.frontmatter.summary && (
        <p className="summary">{entry.frontmatter.summary}</p>
      )}
      {entry.body && (
        <div className="markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ alt, src }) => {
                const imageSrc = typeof src === 'string' ? src : undefined
                if (!imageSrc) return null

                return (
                  <a
                    className="markdown-image-link"
                    href={imageSrc}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image
                      alt={alt ?? ''}
                      src={imageSrc}
                      width={1200}
                      height={800}
                      sizes="(max-width: 760px) 100vw, 720px"
                    />
                  </a>
                )
              },
            }}
          >
            {entry.body}
          </ReactMarkdown>
        </div>
      )}
      {isWritingIndex && writingItems.length > 0 && (
        <WritingCategorySections items={writingItems} />
      )}
      {!isWritingIndex && writingItems.length > 0 && (
        <WritingList
          items={writingItems}
          mode={isWritingAll ? 'infinite' : 'static'}
        />
      )}
    </article>
  )
}

function WritingCategorySections({ items }: { items: WritingListItem[] }) {
  return (
    <div className="writing-sections">
      <section className="writing-section" aria-labelledby="ai-writing">
        <div className="section-heading">
          <h2 id="ai-writing">AI</h2>
          <Link href="/blog/all">All writing</Link>
        </div>
        <div className="card-grid">
          {items.map((item) => (
            <WritingCard item={item} key={item.path} />
          ))}
        </div>
      </section>
      <section className="writing-section" aria-labelledby="curio-writing">
        <div className="section-heading">
          <h2 id="curio-writing">Curio</h2>
        </div>
        <div className="card-grid">
          <Link className="writing-card" href={CURIO_WORDS_PATH}>
            <span className="card-thumb card-thumb-placeholder" />
            <span className="card-copy">
              <span className="card-title">
                Words having no translation to English
              </span>
              <span className="card-summary">
                A small collection of words and phrases that do not map cleanly
                into English.
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}

function WritingCard({ item }: { item: WritingListItem }) {
  return (
    <Link className="writing-card" href={item.path}>
      {item.image ? (
        <span className="card-thumb">
          <Image src={item.image} alt="" fill sizes="(max-width: 640px) 100vw, 220px" />
        </span>
      ) : (
        <span className="card-thumb card-thumb-placeholder" />
      )}
      <span className="card-copy">
        {item.date && (
          <time dateTime={item.date}>{formatShortDate(new Date(item.date))}</time>
        )}
        <span className="card-title">{item.title}</span>
        {item.summary && <span className="card-summary">{item.summary}</span>}
      </span>
    </Link>
  )
}

function toWritingListItem(entry: ContentEntry): WritingListItem {
  return {
    path: slugToPath(entry.slug),
    title: entry.frontmatter.title,
    summary: entry.frontmatter.summary,
    date: entry.frontmatter.date?.toISOString(),
    image: entry.frontmatter.image,
  }
}

function isHiddenFromHome(entry: ContentEntry): boolean {
  const path = slugToPath(entry.slug)
  return path === '/privacy' || path === '/resume' || path === '/blog/all'
}

function isBlogPost(entry: ContentEntry): boolean {
  return (
    entry.frontmatter.type === 'post' &&
    entry.slug[0] === 'blog' &&
    entry.slug.length > 1
  )
}

function isBlogIndex(slug: string[]): boolean {
  return slug.length === 1 && slug[0] === 'blog'
}

function isBlogAll(slug: string[]): boolean {
  return slug.length === 2 && slug[0] === 'blog' && slug[1] === 'all'
}

function sortByDate(a: ContentEntry, b: ContentEntry): number {
  return (
    (b.frontmatter.date?.getTime() ?? 0) -
    (a.frontmatter.date?.getTime() ?? 0)
  )
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
