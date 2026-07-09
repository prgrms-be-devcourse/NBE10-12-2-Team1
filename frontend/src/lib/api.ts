export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const protectedPathPrefixes = [
  "/feed",
  "/profile",
  "/search",
  "/recommend",
  "/lists",
  "/restaurant",
] as const;

function clearClientSession() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("login-state-change"));
}

function shouldRedirectToLogin(status: number) {
  if (typeof window === "undefined" || status !== 401) return false;
  return protectedPathPrefixes.some((prefix) => window.location.pathname.startsWith(prefix));
}

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
    if (shouldRedirectToLogin(res.status)) {
      clearClientSession();
      window.location.assign("/login");
    }

    return { ok: false, message: json.message || "요청에 실패했습니다." };
  }

  return { ok: true, data: json.data, message: json.message };
}

export async function apiUploadImage(file: File): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/feeds/images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (shouldRedirectToLogin(res.status)) {
      clearClientSession();
      window.location.assign("/login");
    }
    return { ok: false, message: json.message || "이미지 업로드에 실패했습니다." };
  }

  return { ok: true, url: json.data as string };
}
