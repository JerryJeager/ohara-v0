// Client-side cookie helpers (for use in client components)

export const setCookie = (
  name: string,
  value: string,
  opts?: { maxAge?: number; path?: string }
) => {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  if (opts?.maxAge != null) parts.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  parts.push(`Path=${opts?.path ?? '/'}`);
  document.cookie = parts.join('; ');
};

export const getCookie = (name: string): string | null => {
  const pairs = document.cookie.split(';').map(s => s.trim());
  const prefix = `${encodeURIComponent(name)}=`;
  for (const p of pairs) {
    if (p.startsWith(prefix)) return decodeURIComponent(p.slice(prefix.length));
  }
  return null;
};

export const deleteCookie = (name: string) => {
  // set cookie in past
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/`;
};
