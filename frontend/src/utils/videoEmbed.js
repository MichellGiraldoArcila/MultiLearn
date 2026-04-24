/**
 * Convierte URL de YouTube o Vimeo en URL apta para iframe embed.
 * @param {string | null | undefined} rawUrl
 * @returns {{ provider: 'youtube'|'vimeo', embedUrl: string } | null}
 */
export function getVideoEmbedFromUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      if (id) {
        return {
          provider: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
        };
      }
    }

    if (host.endsWith('youtube.com')) {
      const path = u.pathname || '';
      if (path.startsWith('/embed/')) {
        const id = path.replace(/^\/embed\//, '').split('/')[0];
        if (id) {
          return {
            provider: 'youtube',
            embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
          };
        }
      }
      const v = u.searchParams.get('v');
      if (v) {
        return {
          provider: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v)}`,
        };
      }
      const shorts = path.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) {
        return {
          provider: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(shorts[1])}`,
        };
      }
    }

    if (host.endsWith('vimeo.com')) {
      const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
      if (m?.[1]) {
        return {
          provider: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${m[1]}`,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}
