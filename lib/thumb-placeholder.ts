export function thumbPlaceholderClass(path: string): string {
  return `thumb-placeholder thumb-placeholder-${hashPath(path) % 3}`
}

function hashPath(path: string): number {
  let hash = 0
  for (let index = 0; index < path.length; index += 1) {
    hash = (hash * 31 + path.charCodeAt(index)) >>> 0
  }
  return hash
}
