'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

export interface WritingListItem {
  path: string
  title: string
  summary?: string
  date?: string
  image?: string
}

interface WritingListProps {
  allHref?: string
  initialCount?: number
  items: WritingListItem[]
  mode?: 'static' | 'infinite'
}

const PAGE_SIZE = 8

export function WritingList({
  allHref,
  initialCount,
  items,
  mode = 'static',
}: WritingListProps) {
  const startingCount =
    initialCount ?? (mode === 'infinite' ? Math.min(PAGE_SIZE, items.length) : items.length)
  const [visibleCount, setVisibleCount] = useState(startingCount)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  )

  useEffect(() => {
    if (mode !== 'infinite') return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return

      setVisibleCount((count) => Math.min(count + PAGE_SIZE, items.length))
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [items.length, mode])

  return (
    <>
      <section className="entry-list" aria-label="Recent pages">
        {visibleItems.map((item) => (
          <div className="entry" key={item.path}>
            {item.image ? (
              <a className="entry-thumb" href={item.path} aria-label={item.title}>
                <Image src={item.image} alt="" fill sizes="112px" />
              </a>
            ) : (
              <span className="entry-thumb entry-thumb-placeholder" />
            )}
            <div className="entry-copy">
              {item.date && (
                <time dateTime={item.date}>
                  {formatDate(new Date(item.date))}
                </time>
              )}
              <a href={item.path}>{item.title}</a>
              {item.summary && <p>{item.summary}</p>}
            </div>
          </div>
        ))}
      </section>
      {allHref && visibleCount < items.length && (
        <p className="all-writing-link">
          <a href={allHref}>All writing</a>
        </p>
      )}
      {mode === 'infinite' && visibleCount < items.length && (
        <div className="load-sentinel" ref={sentinelRef} aria-hidden="true" />
      )}
    </>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
