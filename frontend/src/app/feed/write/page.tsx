"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, ImagePlus, Send, Lightbulb, Search } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";
import type { KakaoPlaceItem } from "@/types/kakao";

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
  const [recentPosts, setRecentPosts] = useState<{ feedId: number; nickname: string; content: string }[]>([]);

  useEffect(() => {
    const loadRecent = async () => {
      const res = await apiFetchJson<{ feeds: { feedId: number; nickname: string; content: string }[] }>(
        "/api/v1/feeds/recommend"
      );
      if (res.ok && res.data) {
        setRecentPosts(res.data.feeds.slice(0, 3));
      }
    };

    loadRecent();
  }, []);

  const handleSearch = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);

    const services = window.kakao?.maps?.services;
    if (!services) {
      alert("카카오맵 SDK를 불러오지 못했습니다.");
      setSearching(false);
      return;
    }

    const places = new services.Places();
    places.keywordSearch(
      query.trim(),
      (data: KakaoPlaceItem[], status: string) => {
        if (status === services.Status.OK) {
          const mapped: KakaoRestaurant[] = data.map((item) => {
            const addressParts = item.address_name ? item.address_name.split(" ") : [];
            return {
              kakaoPlaceId: item.id,
              name: item.place_name,
              category: item.category_name,
              address: item.address_name,
              roadAddress: item.road_address_name,
              region1: addressParts[0] || "",
              region2: addressParts[1] || "",
              region3: addressParts[2] || "",
              phone: item.phone,
              lat: parseFloat(item.y),
              lng: parseFloat(item.x),
            };
          });
          setSearchResults(mapped);
        } else {
          alert("검색 결과를 불러오지 못했습니다.");
          setSearchResults([]);
        }
        setSearching(false);
      },
      {
        category_group_code: "FD6",
        size: 15,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);

    let restaurantId: number | null = null;

    if (selectedRestaurant) {
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

      restaurantId = saveRes.data.id;
    }

    const feedRes = await apiFetchJson("/api/v1/feeds", {
      method: "POST",
      body: JSON.stringify({
        content: content.trim(),
        restaurantId,
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
          <LeftRecentPosts posts={recentPosts} />
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
            <label className="text-xs font-bold text-muted mb-2 block">태그된 식당 (선택)</label>
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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="식당명을 입력하세요"
                    className="flex-1 rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 text-sm focus:border-primary focus:outline-hidden"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-active transition-colors disabled:opacity-70"
                  >
                    <Search className="h-4 w-4" />
                    {searching ? "검색 중..." : "검색"}
                  </button>
                </div>
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
                <p className="text-xs text-muted">식당을 선택하지 않아도 포스트를 작성할 수 있어요.</p>
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

function LeftRecentPosts({ posts }: { posts: { feedId: number; nickname: string; content: string }[] }) {
  return (
    <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
      <p className="text-sm font-bold text-ink mb-3">최근 피드</p>
      {posts.length === 0 ? (
        <p className="text-xs text-muted">최근 피드가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Link key={p.feedId} href={`/feed`} className="flex gap-2.5 group">
              <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {p.nickname[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors">{p.nickname}</p>
                <p className="text-xs text-muted line-clamp-2">{p.content}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
