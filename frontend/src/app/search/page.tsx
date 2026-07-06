"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Navigation } from "lucide-react";
import AppShell, { SidebarProfile, SidebarCard } from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";

const hotPlaces = [
  { name: "연남동 스시 오마카세", category: "일식", likes: 234 },
  { name: "성수동 카페거리", category: "카페", likes: 189 },
  { name: "이태원 양식당", category: "양식", likes: 156 },
];

const categories = ["전체", "한식", "일식", "양식", "중식", "분식", "카페"];

interface KakaoRestaurant {
  id?: number; // DB 식당 ID (6번 추가). 없으면 아직 저장되지 않은 카카오 장소
  kakaoPlaceId: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  region1: string;
  region2: string;
  region3: string;
  phone: string;
  lat: number;
  lng: number;
}

function matchesCategory(item: KakaoRestaurant, category: string): boolean {
  if (category === "전체") return true;
  return item.category.includes(category);
}

export default function SearchPage() {
  const [query, setQuery] = useState("을지로 맛집");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [results, setResults] = useState<KakaoRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("keyword", query.trim());

    const res = await apiFetchJson<KakaoRestaurant[]>(`/api/v1/restaurants/search?${params.toString()}`);

    if (res.ok && res.data) {
      setResults(res.data);
    } else {
      setError(res.message || "검색 결과를 불러오지 못했습니다.");
      setResults([]);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSearch();
  };

  const filtered = results.filter((r) => matchesCategory(r, activeCategory));

  return (
    <AppShell
      leftSidebar={
        <div className="sticky top-28 space-y-5">
          <SidebarProfile />
          <SidebarCard title="오늘의 핫플">
            <div className="space-y-4">
              {hotPlaces.map((p, i) => (
                <div key={p.name} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-bold text-ink">{p.name}</p>
                    <p className="text-sm text-muted">{p.category} · 좋아요 {p.likes}</p>
                  </div>
                </div>
              ))}
            </div>
          </SidebarCard>
        </div>
      }
    >
      <div className="relative h-[calc(100vh-6.5rem)] overflow-hidden rounded-2xl border border-hairline-soft">
        {/* Map — full main background */}
        <div className="absolute inset-0 flex items-center justify-center bg-surface-strong">
          <div className="text-center text-muted">
            <MapPin className="mx-auto mb-3 h-12 w-12 text-primary" />
            <p className="text-sm">Kakao Map 연동 예정</p>
          </div>
        </div>

        <button className="absolute bottom-4 right-4 flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-surface-soft px-4 py-2 text-xs font-bold text-ink shadow-sm transition-colors hover:bg-white">
          <Navigation className="h-3.5 w-3.5 text-primary" />
          현재 위치
        </button>

        {/* Top floating search & filter bar */}
        <div className="absolute inset-x-4 top-4 z-10 md:inset-x-auto md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-hairline-soft bg-surface/90 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-soft px-4 py-2.5">
              <Search className="h-5 w-5 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-ink outline-hidden placeholder:text-muted-soft"
                placeholder="지역, 식당명, 음식 종류를 입력하세요"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-active disabled:opacity-70"
              >
                {loading ? "검색 중..." : "검색"}
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    cat === activeCategory
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:bg-hairline-soft"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Bottom results sheet */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
          <div className="rounded-2xl border border-hairline-soft bg-surface/95 p-4 shadow-lg backdrop-blur">
            {error ? (
              <p className="text-center text-sm text-red-500 py-4">{error}</p>
            ) : (
              <>
                <p className="mb-3 text-sm font-bold text-ink">
                  검색 결과 <span className="text-primary">{filtered.length}개</span>
                </p>

                <div className="flex gap-4 overflow-x-auto pb-2">
                  {filtered.map((r) => (
                    <Link key={r.kakaoPlaceId} href={`/restaurant/${r.id || r.kakaoPlaceId}`} className="shrink-0">
                      <article className="group w-64 overflow-hidden rounded-2xl border border-hairline-soft bg-surface shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
                        <div className="h-32 w-full overflow-hidden bg-surface-strong">
                          <img
                            src={`https://picsum.photos/seed/${r.kakaoPlaceId}/400/240`}
                            alt={r.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-base font-bold text-ink">{r.name}</h3>
                            <span className="shrink-0 text-xs text-muted">{r.category}</span>
                          </div>
                          <p className="mt-2 text-xs leading-4 text-body line-clamp-2">{r.roadAddress || r.address}</p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
