"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Navigation } from "lucide-react";
import AppShell from "@/components/AppShell";

const categories = ["전체", "한식", "일식", "양식", "중식", "분식", "카페"];

const mockResults = [
  {
    id: 1,
    name: "을지로 칼국수",
    category: "한식",
    roadAddress: "서울 중구 을지로 12길 5",
    postCount: 128,
    imageSeed: "kalguksu",
  },
  {
    id: 2,
    name: "연남동 스시 오마카세",
    category: "일식",
    roadAddress: "서울 마포구 성미산로 17",
    postCount: 86,
    imageSeed: "sushi",
  },
  {
    id: 3,
    name: "이태원 양식당",
    category: "양식",
    roadAddress: "서울 용산구 이태원로 55",
    postCount: 214,
    imageSeed: "pasta",
  },
  {
    id: 4,
    name: "망원동 중국집",
    category: "중식",
    roadAddress: "서울 마포구 망원로 23",
    postCount: 95,
    imageSeed: "chinese",
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("을지로 맛집");
  const [activeCategory, setActiveCategory] = useState("전체");

  const filtered = activeCategory === "전체" ? mockResults : mockResults.filter((r) => r.category === activeCategory);

  return (
    <AppShell
      rightSidebar={
        <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
          <p className="text-sm font-bold text-ink mb-3">지도</p>
          <div className="aspect-square rounded-xl bg-surface-strong flex items-center justify-center">
            <div className="text-center text-muted">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-xs">Kakao Map 연동 예정</p>
            </div>
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-hairline bg-surface-soft py-2 text-xs font-bold text-ink hover:bg-white transition-colors">
            <Navigation className="h-3.5 w-3.5 text-primary" />
            현재 위치
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-ink">식당 검색</h2>
          <p className="text-sm text-muted">원하는 지역과 음식을 찾아보세요</p>
        </div>

        <div className="rounded-2xl bg-surface p-4 border border-hairline-soft shadow-sm space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-soft px-4 py-2.5">
            <Search className="h-5 w-5 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-ink outline-hidden placeholder:text-muted-soft"
              placeholder="지역, 식당명, 음식 종류를 입력하세요"
            />
            <button className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-active transition-colors">
              검색
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
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
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-ink">검색 결과 <span className="text-primary">{filtered.length}개</span></p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((r) => (
            <Link key={r.id} href={`/restaurant/${r.id}`}>
              <article className="group overflow-hidden rounded-2xl bg-surface border border-hairline-soft shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                <div className="h-40 w-full bg-surface-strong overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/${r.imageSeed}/400/240`}
                    alt={r.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-base font-bold text-ink">{r.name}</h3>
                    <span className="text-xs text-muted shrink-0">포스트 {r.postCount}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{r.category}</p>
                  <p className="mt-2 text-xs leading-4 text-body">{r.roadAddress}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
