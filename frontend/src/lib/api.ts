const API_BASE = "";

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
  });
}

export async function apiFetchJson<T = unknown>(path: string, options?: RequestInit): Promise<{ ok: boolean; data?: T; message?: string }> {
  const res = await apiFetch(path, options);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, message: json.message || "요청에 실패했습니다." };
  }

  return { ok: true, data: json.data, message: json.message };
}
