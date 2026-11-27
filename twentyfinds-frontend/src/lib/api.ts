export function apiUrlFor(path: string): string {
  return `/api/${path.replace(/^\/+/, "")}`;
}
