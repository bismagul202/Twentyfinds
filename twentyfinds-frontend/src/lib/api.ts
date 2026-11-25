const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/** Base URL for requests to the Laravel API. Set NEXT_PUBLIC_API_URL in .env.local. */
export const API_BASE_URL = apiUrl?.replace(/\/$/, "") ?? "http://localhost:8000/api";

export function apiUrlFor(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
