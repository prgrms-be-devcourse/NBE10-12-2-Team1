"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, ImagePlus, Send, Lightbulb, Search } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";

const moods = ["혼밥", "데이트", "회식", "가족", "친구"];

interface KakaoRestaurant {
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

const recentPosts = [
  { id: "user1", author: "김푸디", content: "을지로 오면 무조건 여기! 곱창이 너무 부드럽고...", seed: "user1" },
  { id: "user2", author: "맛탐정_소연", content: "블루보틀 삼성점 분위기 최고였어요.", seed: "user2" },
];

const guideItems = [
  "방문한 식당을 태그하면 지도에서도 확인할 수 있어요.",
  "분위기 태그를 선택하면 비슷한 취향의 푸디들에게 노출돼요.",
  "솔직한 후기일수록 다른 사용자들에게 도움이 돼요.",
];

export default function WritePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("혼밥");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KakaoRestaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<KakaoRestaurant | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const res = await apiFetchJson<KakaoRestaurant[]>(`/api/v1/restaurants/search?keyword=${encodeURIComponent(query.trim())}`);
    if (res.ok && res.data) {
      setSearchResults(res.data);
    } else {
      alert(res.message || "식당 검색에 실패했습니다.");
      setSearchResults([]);
    }
    setSearching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!selectedRestaurant) {
      alert("식당을 선택해주세요.");
      return;
    }

    setSubmitting(true);

    const saveRes = await apiFetchJson<{ id: number }>("/api/v1/restaurants", {
      method: "POST",
      body: JSON.stringify({
        kakaoPlaceId: selectedRestaurant.kakaoPlaceId,
        name: selectedRestaurant.name,
        categoryName: selectedRestaurant.category,
        address: selectedRestaurant.address,
        roadAddress: selectedRestaurant.roadAddress,
        region1: selectedRestaurant.region1,
        region2: selectedRestaurant.region2,
        region3: selectedRestaurant.region3,
        phone: selectedRestaurant.phone,
        lat: selectedRestaurant.lat,
        lng: selectedRestaurant.lng,
      }),
    });

    if (!saveRes.ok || !saveRes.data) {
      alert(saveRes.message || "식당 저장에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    const feedRes = await apiFetchJson("/api/v1/feeds", {
      method: "POST",
      body: JSON.stringify({
        content: content.trim(),
        restaurantId: saveRes.data.id,
      }),
    });

    if (feedRes.ok) {
      router.push("/feed");
    } else {
      alert(feedRes.message || "피드 작성에 실패했습니다.");
    }

    setSubmitting(false);
  };

  return (
    <AppShell
      leftSidebar={
        <div className="sticky top-20 space-y-5">
          <LeftRecentPosts />
        </div>
      }
      rightSidebar={
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
            <p className="text-sm font-bold text-ink mb-3">작성 가이드</p>
            <ul className="space-y-2.5">
              {guideItems.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-body leading-relaxed">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink transition-colors">
            <ArrowLeft className="h-4 w-4" />
            피드로 돌아가기
          </Link>
          <h2 className="text-xl font-bold text-ink">새 포스트 작성</h2>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface p-6 border border-hairline-soft shadow-sm space-y-5">
          {/* Tagged restaurant */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted mb-2 block">태그된 식당</label>
            {selectedRestaurant ? (
              <div className="flex items-center justify-between rounded-xl bg-primary-soft p-3">
                <div>
                  <p className="text-sm font-bold text-ink">{selectedRestaurant.name}</p>
                  <p className="text-xs text-muted">{selectedRestaurant.roadAddress || selectedRestaurant.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRestaurant(null)}
                  className="rounded-full p-1.5 text-muted hover:bg-white/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="식당명을 입력하세요"
                    className="flex-1 rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 text-sm focus:border-primary focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-active transition-colors disabled:opacity-70"
                  >
                    <Search className="h-4 w-4" />
                    {searching ? "검색 중..." : "검색"}
                  </button>
                </form>
                <div className="space-y-2">
                  {searchResults.map((r) => (
                    <button
                      key={r.kakaoPlaceId}
                      type="button"
                      onClick={() => setSelectedRestaurant(r)}
                      className="w-full rounded-xl border border-hairline-soft bg-surface-soft p-3 text-left hover:border-primary/30 transition-colors"
                    >
                      <p className="text-sm font-bold text-ink">{r.name}</p>
                      <p className="text-xs text-muted">{r.roadAddress || r.address}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mood tags */}
          <div>
            <label className="text-xs font-bold text-muted mb-2 block">분위기 태그</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                    selectedMood === mood
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:bg-hairline-soft"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-bold text-muted mb-2 block">포스트 내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="식당에 대한 솔직한 후기를 남겨주세요."
              rows={6}
              maxLength={1000}
              className="w-full rounded-xl border border-hairline bg-surface-soft p-4 text-sm focus:border-primary focus:outline-hidden resize-none"
              required
            />
            <p className="mt-1 text-right text-xs text-muted-soft">{content.length}/1000</p>
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-xs font-bold text-muted mb-2 block">사진 추가 (선택)</label>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-hairline bg-surface-soft py-8 text-muted hover:border-primary/30 hover:text-primary transition-colors"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-sm font-medium">클릭하거나 드래그하여 사진 추가</span>
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-active transition-colors disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              {submitting ? "등록 중..." : "포스트 올리기"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export function LeftRecentPosts() {
  return (
    <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
      <p className="text-sm font-bold text-ink mb-3">최근 피드</p>
      <div className="space-y-3">
        {recentPosts.map((p) => (
          <Link key={p.id} href={`/profile/${p.id}`} className="flex gap-2.5 group">
            <img src={`https://picsum.photos/seed/${p.seed}/40/40`} alt="" className="h-7 w-7 rounded-full object-cover shrink-0 group-hover:ring-2 group-hover:ring-primary/30 transition-all" />
            <div>
              <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors">{p.author}</p>
              <p className="text-xs text-muted line-clamp-2">{p.content}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
