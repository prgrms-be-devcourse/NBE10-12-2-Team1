"use client";

import { ReactNode, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Map, List, Sparkles, User, Bell, Search, LogOut, Settings } from "lucide-react";
import { CurrentUser, getStoredUser } from "@/lib/user";
import { apiFetchJson } from "@/lib/api";

interface AppShellProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  hideSidebars?: boolean;
}

const mainNav = [
  { href: "/feed", label: "피드", icon: Home },
  { href: "/search", label: "탐색", icon: Map },
  { href: "/lists", label: "리스트", icon: List },
  { href: "/recommend", label: "추천", icon: Sparkles },
  { href: "/profile", label: "프로필", icon: User },
];

const fallbackUser: CurrentUser = {
  userId: 0,
  nickname: "게스트",
  profileImage: "/default-profile.png",
  email: "",
};

interface FeedListPageResponse {
  feeds: unknown[];
}

export function SidebarProfile() {
  const [user, setUser] = useState<CurrentUser>(() => getStoredUser() ?? fallbackUser);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);

  useEffect(() => {
    const handleChange = () => setUser(getStoredUser() ?? fallbackUser);
    window.addEventListener("login-state-change", handleChange);
    return () => window.removeEventListener("login-state-change", handleChange);
  }, []);

  useEffect(() => {
    if (!user.userId) return;

    const loadCounts = async () => {
      const [countRes, feedRes] = await Promise.all([
        apiFetchJson<{ userId: number; followerCount: number; followingCount: number }>(
          `/api/v1/follows/users/${user.userId}/count`
        ),
        apiFetchJson<FeedListPageResponse>(`/api/v1/feeds?userId=${user.userId}`),
      ]);

      if (countRes.ok && countRes.data) {
        setFollowerCount(countRes.data.followerCount);
        setFollowingCount(countRes.data.followingCount);
      }

      if (feedRes.ok && feedRes.data) {
        setPostCount(feedRes.data.feeds.length);
      }
    };

    loadCounts();
  }, [user.userId]);

  return (
    <Link href="/profile" className="block rounded-2xl bg-surface p-5 border border-hairline-soft hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-4">
        <img
          src={user.profileImage ?? "/default-profile.png"}
          alt=""
          className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
        />
        <div>
          <p className="text-base font-bold text-ink">{user.nickname}</p>
          <p className="text-sm text-muted">{user.email || "로그인이 필요합니다"}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-center text-base">
        <div>
          <p className="font-bold text-ink">{followingCount ?? "-"}</p>
          <p className="text-xs text-muted">팔로잉</p>
        </div>
        <div>
          <p className="font-bold text-ink">{followerCount ?? "-"}</p>
          <p className="text-xs text-muted">팔로워</p>
        </div>
        <div>
          <p className="font-bold text-ink">{postCount ?? "-"}</p>
          <p className="text-xs text-muted">포스트</p>
        </div>
      </div>
    </Link>
  );
}

export function SidebarCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface p-5 border border-hairline-soft">
      <p className="text-base font-bold text-ink mb-4">{title}</p>
      {children}
    </div>
  );
}

function DefaultLeftSidebar() {
  return (
    <div className="sticky top-28 space-y-5">
      <SidebarProfile />
    </div>
  );
}

export default function AppShell({
  children,
  leftSidebar,
  rightSidebar,
  hideSidebars = false,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser>(() => getStoredUser() ?? fallbackUser);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleChange = () => setUser(getStoredUser() ?? fallbackUser);
    window.addEventListener("login-state-change", handleChange);
    return () => window.removeEventListener("login-state-change", handleChange);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // 서버 요청 실패핏 localStorage 클리어 및 이동
    } finally {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("login-state-change"));
      router.push("/login");
    }
  };

  if (hideSidebars) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-hairline-soft bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-[100px] max-w-[calc(100vw-200px)] items-center px-4 lg:px-0">
          <div className="flex items-center gap-8">
            <Link href="/feed" className="text-2xl font-bold tracking-tight text-primary">
              오늘뭐먹지
            </Link>
            {mounted && (
              <div className="hidden md:flex items-center rounded-full bg-surface-soft px-4 py-2">
                <Search className="h-5 w-5 text-muted" />
                <input
                  type="text"
                  placeholder="맛집, 지역 검색..."
                  className="ml-3 bg-transparent text-base text-ink placeholder:text-muted-soft focus:outline-hidden w-56"
                  suppressHydrationWarning
                />
              </div>
            )}
          </div>

          <nav className="hidden lg:flex items-center justify-end gap-2 ml-auto">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-base font-semibold transition-all ${
                    active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-surface-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 ml-8">
            <button className="rounded-full p-2.5 text-muted hover:bg-surface-soft hover:text-ink transition-colors">
              <Bell className="h-6 w-6" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/20 focus:outline-hidden"
              >
                <img
                  src={user.profileImage ?? "/default-profile.png"}
                  alt="프로필"
                  className="h-full w-full object-cover"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-hairline-soft bg-surface py-2 shadow-lg animate-in fade-in-50 zoom-in-95">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-base font-semibold text-ink hover:bg-surface-soft transition-colors"
                  >
                    <User className="h-5 w-5 text-muted" />
                    마이페이지
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-base font-semibold text-ink hover:bg-surface-soft transition-colors"
                  >
                    <Settings className="h-5 w-5 text-muted" />
                    내 정보 수정
                  </Link>
                  <div className="my-1 border-t border-hairline-soft" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-base font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[calc(100vw-200px)] grid-cols-1 gap-5 px-4 py-6 md:grid-cols-[300px_1fr_300px] lg:px-0">
        <aside className="hidden md:block">
          <Suspense
            fallback={
              <div className="sticky top-28 space-y-5">
                <div className="h-40 rounded-2xl bg-surface border border-hairline-soft animate-pulse" />
                <div className="h-56 rounded-2xl bg-surface border border-hairline-soft animate-pulse" />
              </div>
            }
          >
            {leftSidebar ?? <DefaultLeftSidebar />}
          </Suspense>
        </aside>

        <main className="min-w-0">{children}</main>

        <aside className="hidden md:block">
          <div className="sticky top-28">{rightSidebar}</div>
        </aside>
      </div>
    </div>
  );
}
