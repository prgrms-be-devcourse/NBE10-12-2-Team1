"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
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

const followings = [
  { id: "user1", name: "김푸디", img: "user1" },
  { id: "user2", name: "맛탐정_소연", img: "user2" },
  { id: "user3", name: "혼밥러", img: "user3" },
  { id: "user4", name: "점심러", img: "user4" },
];

const currentUser = {
  id: "me",
  name: "오늘의푸디",
  handle: "@todayfoodie",
  image: "https://picsum.photos/seed/myprofile/80/80",
};

function DefaultLeftSidebar() {
  const pathname = usePathname();
  return (
    <div className="sticky top-20 space-y-5">
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

      <nav className="space-y-1">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">팔로잉</p>
        <div className="space-y-2.5">
          {followings.map((f) => (
            <Link key={f.id} href={`/profile/${f.id}`} className="flex items-center gap-2.5 group">
              <div className="relative">
                <img
                  src={`https://picsum.photos/seed/${f.img}/40/40`}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
              </div>
              <span className="text-sm text-ink group-hover:text-primary transition-colors">{f.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-primary-soft p-3">
        <p className="text-xs font-bold text-primary-active mb-1">새로운 맛집 소식 받기</p>
        <p className="text-[11px] text-muted mb-2">팔로잉의 최신 피드를 높치지 마세요.</p>
        <button className="w-full rounded-lg bg-primary py-1.5 text-xs font-bold text-white hover:bg-primary-active transition-colors">
          알림 설정하기
        </button>
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
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/feed" className="text-lg font-bold tracking-tight text-primary">
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

          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 text-muted hover:bg-surface-soft hover:text-ink transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile dropdown */}
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

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr_300px]">
        <aside className="hidden md:block">
          {leftSidebar ?? <DefaultLeftSidebar />}
        </aside>

        <main className="min-w-0">{children}</main>

        <aside className="hidden md:block">
          <div className="sticky top-20">{rightSidebar}</div>
        </aside>
      </div>
    </div>
  );
}
