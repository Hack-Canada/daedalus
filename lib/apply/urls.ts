function withScheme(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isHttpUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(withScheme(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSocialUrl(value: string, hosts: string[]) {
  if (!value.trim()) return true;
  try {
    const url = new URL(withScheme(value));
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.split("/").filter(Boolean);
    return hosts.includes(host) && path.length >= 1;
  } catch {
    return false;
  }
}
