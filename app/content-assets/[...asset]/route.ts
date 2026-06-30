import fs from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { CONTENT_ROOT } from '@/lib/content'

const MIME_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset?: string[] }> },
) {
  const { asset = [] } = await params
  if (asset.length === 0) return notFound()

  const filePath = path.resolve(CONTENT_ROOT, ...asset)
  const relativePath = path.relative(CONTENT_ROOT, filePath)
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return notFound()
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext]
  if (!contentType) return notFound()

  try {
    const stat = await fs.stat(filePath)
    if (!stat.isFile()) return notFound()
    const body = await fs.readFile(filePath)

    return new NextResponse(new Uint8Array(body), {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': contentType,
      },
    })
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return notFound()
    throw err
  }
}

function notFound() {
  return new NextResponse('Not found', { status: 404 })
}
