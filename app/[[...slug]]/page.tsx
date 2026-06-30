import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getEntryBySlug,
  listEntries,
  contentAssetUrl,
  slugToPath,
  type ContentEntry,
} from '@/lib/content'
import { thumbPlaceholderClass } from '@/lib/thumb-placeholder'
import { WritingList, type WritingListItem } from '@/components/writing-list'

const CATEGORY_PREVIEW_COUNT = 5

type WritingCategory = 'ai' | 'curio'

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
  const image = entry.frontmatter.image
    ? contentAssetUrl(entry.slug, entry.frontmatter.image)
    : undefined
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
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: entry.frontmatter.title,
      description: entry.frontmatter.summary,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ContentPage({ params }: PageProps) {
  const { slug = [] } = await params
  const category = getWritingCategoryFromSlug(slug)
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
  const writingEntries = entries.filter(hasWritingCategory).sort(sortByDate)
  const writingCategoryItems = toWritingCategoryItems(writingEntries)
  const listedEntries = entries
    .filter((item) =>
      isWritingIndex
        ? hasWritingCategory(item)
        : isWritingAll
          ? matchesWritingCategory(item, category)
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
                const imageSrc =
                  typeof src === 'string'
                    ? contentAssetUrl(entry.slug, src)
                    : undefined
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
        <WritingCategorySections
          aiItems={writingCategoryItems.ai}
          curioItems={writingCategoryItems.curio}
        />
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

function WritingCategorySections({
  aiItems,
  curioItems,
}: {
  aiItems: WritingListItem[]
  curioItems: WritingListItem[]
}) {
  return (
    <div className="writing-sections">
      <WritingCategorySection
        allHref="/blog/all/ai"
        items={aiItems}
        label="AI"
        sectionId="ai-writing"
      />
      <WritingCategorySection
        allHref="/blog/all/curio"
        items={curioItems}
        label="Curio"
        sectionId="curio-writing"
      />
    </div>
  )
}

function WritingCategorySection({
  allHref,
  items,
  label,
  sectionId,
}: {
  allHref: string
  items: WritingListItem[]
  label: string
  sectionId: string
}) {
  if (items.length === 0) return null

  return (
    <section className="writing-section" aria-labelledby={sectionId}>
      <div className="section-heading">
        <h2 id={sectionId}>{label}</h2>
        <Link href={allHref}>See all writing on {label} &gt;</Link>
      </div>
      <div className="card-grid">
        {items.slice(0, CATEGORY_PREVIEW_COUNT).map((item) => (
          <WritingCard item={item} key={item.path} />
        ))}
      </div>
    </section>
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
        <span
          className={`card-thumb card-thumb-placeholder ${thumbPlaceholderClass(item.path)}`}
        />
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
    image: entry.frontmatter.image
      ? contentAssetUrl(entry.slug, entry.frontmatter.image)
      : undefined,
  }
}

function toWritingCategoryItems(
  entries: ContentEntry[],
): Record<WritingCategory, WritingListItem[]> {
  const items: Record<WritingCategory, WritingListItem[]> = {
    ai: [],
    curio: [],
  }

  for (const entry of entries) {
    const category = getWritingCategory(entry)
    if (category) items[category].push(toWritingListItem(entry))
  }

  return items
}

function isHiddenFromHome(entry: ContentEntry): boolean {
  const path = slugToPath(entry.slug)
  return path === '/privacy' || path === '/resume' || path.startsWith('/blog/all')
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
  if (slug[0] !== 'blog' || slug[1] !== 'all') return false
  return slug.length === 2 || getWritingCategoryFromSlug(slug) !== null
}

function hasWritingCategory(entry: ContentEntry): boolean {
  return getWritingCategory(entry) !== null
}

function matchesWritingCategory(
  entry: ContentEntry,
  category: WritingCategory | null,
): boolean {
  const entryCategory = getWritingCategory(entry)
  return entryCategory !== null && (!category || entryCategory === category)
}

function getWritingCategory(entry: ContentEntry): WritingCategory | null {
  if (isBlogPost(entry)) return 'ai'
  if (entry.frontmatter.type === 'page' && entry.slug[0] === 'curio') return 'curio'
  return null
}

function getWritingCategoryFromSlug(slug: string[]): WritingCategory | null {
  if (slug.length !== 3 || slug[0] !== 'blog' || slug[1] !== 'all') return null
  const category = slug[2]
  return category === 'ai' || category === 'curio' ? category : null
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
