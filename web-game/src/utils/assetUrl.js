/**
 * Resolves static asset paths with Vite's BASE_URL for seamless local and GitHub Pages deployment.
 * Prevents duplicate base prefixes and double slashes.
 */
export function getAssetUrl(path) {
  if (!path) return ''
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }

  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`

  // Avoid prepending base if already present
  if (base !== '/' && path.startsWith(base)) {
    return path
  }

  const cleanPath = path.replace(/^\/+/, '')
  return `${cleanBase}${cleanPath}`
}
