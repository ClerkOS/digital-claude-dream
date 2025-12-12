const BASE_URL = import.meta.env.VITE_API_ROOT || 'http://localhost:8000/api';;

export async function api<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`API Error ${res.status}: ${msg}`);
  }

  return res.json() as Promise<T>;
}