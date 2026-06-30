#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const GRAPH_ROOT = 'https://graph.microsoft.com/v1.0'

function usage() {
  console.log(`Usage: node fetch-onenote-page.mjs <onenote-or-onedrive-url> --out <dir>

Fetches a OneNote page through Microsoft Graph and writes:
  manifest.json
  page.html
  resources/resource-XX.<ext>  (images and attachments)

Auth token lookup:
  GRAPH_ACCESS_TOKEN, M365_LG, or /app/fi/.env.local key M365_LG`)
}

function parseArgs(argv) {
  const args = { url: '', out: '' }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      usage()
      process.exit(0)
    }
    if (arg === '--out') {
      args.out = argv[i + 1] ?? ''
      i += 1
      continue
    }
    if (!args.url) args.url = arg
  }
  if (!args.url || !args.out) {
    usage()
    process.exit(1)
  }
  return args
}

async function tokenFromEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^M365_LG=(.*)$/)
      if (!match) continue
      return match[1].trim().replace(/^['"]|['"]$/g, '')
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  return ''
}

async function getToken() {
  const token =
    process.env.GRAPH_ACCESS_TOKEN ||
    process.env.M365_LG ||
    (await tokenFromEnvFile('/app/fi/.env.local'))
  if (!token) {
    throw new Error('Missing Graph token: set GRAPH_ACCESS_TOKEN or M365_LG')
  }
  return token
}

function parseOneNoteUrl(sourceUrl) {
  const decoded = decodeURIComponent(sourceUrl)
  const wdpart = decoded.match(/wdpartid=\{([0-9a-f-]{36})\}\{(\d+)\}/i)
  const sectionGuid = decoded.match(/section-id=\{?([0-9a-f-]{36})\}?/i)
  const pageGuid = decoded.match(/page-id=\{?([0-9a-f-]{36})\}?/i)
  const target = decoded.match(/wd=target\(([^)]*)\)/i)
  let targetSectionName = ''
  let targetTitle = ''
  if (target) {
    const parts = target[1].split('|')
    const sectionPart = parts[0] || ''
    const titlePart = parts[2] || ''
    targetSectionName = sectionPart
      .split('/')
      .pop()
      ?.replace(/\.one$/i, '')
      .trim() ?? ''
    targetTitle = titlePart.replace(/\\\|/g, '|').trim()
  }
  return {
    graphPartGuid: wdpart?.[1]?.replace(/-/g, '').toLowerCase() ?? '',
    graphPartNumber: wdpart?.[2] ?? '',
    sectionGuid: sectionGuid?.[1]?.replace(/-/g, '').toLowerCase() ?? '',
    pageGuid: pageGuid?.[1]?.replace(/-/g, '').toLowerCase() ?? '',
    targetSectionName,
    targetTitle,
  }
}

async function graphFetch(token, url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Graph request failed ${res.status} ${res.statusText}: ${body}`)
  }
  return res
}

async function listSections(token) {
  const sections = []
  let next =
    `${GRAPH_ROOT}/me/onenote/sections` +
    '?$select=id,displayName' +
    '&$top=100'
  while (next) {
    const json = await graphFetch(token, next).then((res) => res.json())
    sections.push(...(json.value ?? []))
    next = json['@odata.nextLink'] ?? ''
  }
  return sections
}

function findSection(sections, parsed) {
  if (parsed.sectionGuid) {
    const found = sections.find((section) =>
      section.id.toLowerCase().includes(parsed.sectionGuid),
    )
    if (found) return found
  }

  if (parsed.targetSectionName) {
    const normalizedName = parsed.targetSectionName.toLowerCase()
    const found = sections.find((section) =>
      section.displayName?.toLowerCase() === normalizedName,
    )
    if (found) return found
  }

  return null
}

async function listPages(token, sectionId = '') {
  const pages = []
  const base = sectionId
    ? `${GRAPH_ROOT}/me/onenote/sections/${encodeURIComponent(sectionId)}/pages`
    : `${GRAPH_ROOT}/me/onenote/pages`
  let next = `${base}?$select=id,title,createdDateTime,lastModifiedDateTime,links&$top=100`
  while (next) {
    const json = await graphFetch(token, next).then((res) => res.json())
    pages.push(...(json.value ?? []))
    next = json['@odata.nextLink'] ?? ''
  }
  return pages
}

function findPage(pages, parsed) {
  if (parsed.pageGuid) {
    const found = pages.find((page) => page.id.toLowerCase().includes(parsed.pageGuid))
    if (found) return found
  }

  if (parsed.graphPartGuid) {
    const found = pages.find((page) => {
      const id = page.id.toLowerCase()
      return (
        id.includes(parsed.graphPartGuid) &&
        (!parsed.graphPartNumber || id.includes(`!${parsed.graphPartNumber}`))
      )
    })
    if (found) return found
  }

  if (parsed.targetTitle) {
    const normalizedTitle = parsed.targetTitle.toLowerCase()
    const found = pages.find((page) => page.title?.toLowerCase() === normalizedTitle)
    if (found) return found
  }

  throw new Error(
    `Could not locate OneNote page. Parsed target title: ${parsed.targetTitle || '(none)'}`,
  )
}

function extensionFromContentType(contentType) {
  if (contentType.includes('image/png')) return '.png'
  if (contentType.includes('image/jpeg')) return '.jpg'
  if (contentType.includes('image/gif')) return '.gif'
  if (contentType.includes('image/webp')) return '.webp'
  if (contentType.includes('image/svg')) return '.svg'
  if (contentType.includes('application/pdf')) return '.pdf'
  if (contentType.includes('application/msword')) return '.doc'
  if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return '.docx'
  if (contentType.includes('application/vnd.ms-excel')) return '.xls'
  if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) return '.xlsx'
  if (contentType.includes('application/vnd.ms-powerpoint')) return '.ppt'
  if (contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) return '.pptx'
  if (contentType.includes('application/zip')) return '.zip'
  if (contentType.includes('text/csv')) return '.csv'
  if (contentType.includes('text/plain')) return '.txt'
  if (contentType.includes('text/markdown')) return '.md'
  return '.bin'
}

function extensionFromBytes(body) {
  if (body.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png'
  if (body.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return '.jpg'
  if (body.subarray(0, 4).toString('ascii') === '%PDF') return '.pdf'
  if (body.subarray(0, 4).toString('ascii') === 'PK\u0003\u0004') return '.zip'
  return ''
}

function kindFromContentType(contentType, fileName) {
  if (contentType.startsWith('image/')) return 'image'
  if (contentType.includes('application/pdf') || fileName.endsWith('.pdf')) return 'pdf'
  if (fileName.match(/\.(png|jpe?g|gif|webp|svg)$/i)) return 'image'
  return 'attachment'
}

async function downloadResources(token, html, outDir) {
  const resourcesDir = path.join(outDir, 'resources')
  await fs.mkdir(resourcesDir, { recursive: true })
  const urls = [
    ...new Set(
      [...html.matchAll(/https:\/\/graph\.microsoft\.com\/v1\.0\/[^"]+?\/onenote\/resources\/[^"]+?\/\$value/g)]
        .map((match) => match[0].replace(/&amp;/g, '&')),
    ),
  ]

  const resources = []
  for (let i = 0; i < urls.length; i += 1) {
    const url = urls[i]
    const res = await graphFetch(token, url)
    const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
    const body = Buffer.from(await res.arrayBuffer())
    const ext = extensionFromContentType(contentType) === '.bin'
      ? extensionFromBytes(body) || '.bin'
      : extensionFromContentType(contentType)
    const fileName = `resource-${String(i + 1).padStart(2, '0')}${ext}`
    const filePath = path.join(resourcesDir, fileName)
    await fs.writeFile(filePath, body)
    resources.push({
      sourceUrl: url,
      fileName,
      contentType,
      kind: kindFromContentType(contentType, fileName),
      bytes: body.length,
    })
  }
  return resources
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const token = await getToken()
  const parsed = parseOneNoteUrl(args.url)
  const sections = await listSections(token)
  const section = findSection(sections, parsed)
  const pages = await listPages(token, section?.id)
  const page = findPage(pages, parsed)
  const contentUrl = `${GRAPH_ROOT}/me/onenote/pages/${encodeURIComponent(page.id)}/content?includeIDs=true`
  const html = await graphFetch(token, contentUrl).then((res) => res.text())

  await fs.mkdir(args.out, { recursive: true })
  await fs.writeFile(path.join(args.out, 'page.html'), html)
  const resources = await downloadResources(token, html, args.out)
  const manifest = {
    sourceUrl: args.url,
    parsed,
    page,
    contentUrl,
    htmlFile: 'page.html',
    resources,
  }
  await fs.writeFile(
    path.join(args.out, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )

  console.log(`Fetched "${page.title}"`)
  console.log(`Created: ${page.createdDateTime}`)
  console.log(`Resources: ${resources.length}`)
  console.log(`Output: ${args.out}`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
