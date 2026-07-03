"use client";

import { ReactNode, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Map, List, Sparkles, User, Bell, Search, LogOut, Settings } from "lucide-react";

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

const recommendFoodies = [
  { id: "user5", name: "푸디맘", handle: "@foodimom", img: "user5" },
  { id: "user6", name: "카페인 중독", handle: "@cafeholic", img: "user6" },
  { id: "user7", name: "맛집 탐험가", handle: "@foodtrip", img: "user7" },
];

const hotPlaces = [
  { name: "연남동 스시 오마카세", category: "일식", likes: 234 },
  { name: "성수동 카페거리", category: "카페", likes: 189 },
  { name: "이태원 양식당", category: "양식", likes: 156 },
];

const currentUser = {
  id: "me",
  name: "오늘의푸디",
  handle: "@todayfoodie",
  image: "https://picsum.photos/seed/myprofile/80/80",
};

function DefaultLeftSidebar() {
  return (
    <div className="sticky top-28 space-y-5">
      <Link href="/profile" className="block rounded-2xl bg-surface p-4 border border-hairline-soft hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.image}
            alt=""
            className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div>
            <p className="text-sm font-bold text-ink">{currentUser.name}</p>
            <p className="text-xs text-muted">{currentUser.handle}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-between text-center text-sm">
          <div>
            <p className="font-bold text-ink">128</p>
            <p className="text-[10px] text-muted">팔로잉</p>
          </div>
          <div>
            <p className="font-bold text-ink">342</p>
            <p className="text-[10px] text-muted">팔로워</p>
          </div>
          <div>
            <p className="font-bold text-ink">45</p>
            <p className="text-[10px] text-muted">포스트</p>
          </div>
        </div>
      </Link>

      <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
        <p className="text-sm font-bold text-ink mb-3">추천 푸디</p>
        <div className="space-y-3">
          {recommendFoodies.map((f) => (
            <Link key={f.id} href={`/profile/${f.id}`} className="flex items-center justify-between group">
              <div className="flex items-center gap-2.5">
                <img src={`https://picsum.photos/seed/${f.img}/60/60`} alt="" className="h-8 w-8 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors">{f.name}</p>
                  <p className="text-xs text-muted-soft">{f.handle}</p>
                </div>
              </div>
              <button className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-active transition-colors">
                팔로우
              </button>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
        <p className="text-sm font-bold text-ink mb-3">오늘의 핫플</p>
        <div className="space-y-3">
          {hotPlaces.map((p, i) => (
            <div key={p.name} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{p.name}</p>
                <p className="text-xs text-muted">{p.category} · 좋아요 {p.likes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event("login-state-change"));
    router.push("/login");
  };

  if (hideSidebars) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-hairline-soft bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-[100px] max-w-[calc(100vw-200px)] items-center px-4 lg:px-0">
          <div className="flex items-center gap-6">
            <Link href="/feed" className="text-xl font-bold tracking-tight text-primary">
              오늘뭐먹지
            </Link>
            <div className="hidden md:flex items-center rounded-full bg-surface-soft px-3 py-1.5">
              <Search className="h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="맛집, 지역 검색..."
                className="ml-2 bg-transparent text-sm text-ink placeholder:text-muted-soft focus:outline-hidden w-48"
              />
            </div>
          </div>

          <nav className="hidden lg:flex items-center justify-end gap-1 ml-auto">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                    active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-surface-soft hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-6">
            <button className="rounded-full p-2 text-muted hover:bg-surface-soft hover:text-ink transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/20 focus:outline-hidden"
              >
                <img
                  src={currentUser.image}
                  alt="프로필"
                  className="h-full w-full object-cover"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-hairline-soft bg-surface py-1.5 shadow-lg animate-in fade-in-50 zoom-in-95">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft transition-colors"
                  >
                    <User className="h-4 w-4 text-muted" />
                    마이페이지
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted" />
                    내 정보 수정
                  </Link>
                  <div className="my-1 border-t border-hairline-soft" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[calc(100vw-200px)] grid-cols-1 gap-5 px-4 py-6 md:grid-cols-[260px_1fr_300px] lg:px-0">
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
