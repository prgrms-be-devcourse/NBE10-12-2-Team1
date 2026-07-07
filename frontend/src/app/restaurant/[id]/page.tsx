"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Heart,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";

interface Restaurant {
  id: number;
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
  createdAt: string;
}

interface Feed {
  feedId: number;
  content: string;
  userId: number;
  nickname: string;
  profileImage: string | null;
  likeCount: number;
  commentCount: number;
  restaurantId: number | null;
  restaurantName: string | null;
  createdAt: string;
}

interface FeedListPageResponse {
  feeds: Feed[];
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const rawId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      let dbId: number | null = null;
      const numericId = Number(rawId);

      if (!isNaN(numericId)) {
        const res = await apiFetchJson<Restaurant>(
          `/api/v1/restaurants/${numericId}`,
        );
        if (res.ok && res.data) {
          setRestaurant(res.data);
          dbId = res.data.id;
        } else {
          setError(res.message || "식당 정보를 불러오지 못했습니다.");
        }
      } else {
        // kakaoPlaceId만 있는 경우: 검색 페이지에서 id 없이 넘어옴
        // 정상적인 흐름이라면 search 페이지에서 id가 포함되어야 하므로, 여기서는 에러 처리
        setError("식당 정보를 불러오지 못했습니다. 다시 검색해주세요.");
      }

      if (dbId) {
        const feedRes = await apiFetchJson<FeedListPageResponse>(
          `/api/v1/feeds?restaurantId=${dbId}`,
        );
        if (feedRes.ok && feedRes.data) {
          setFeeds(feedRes.data.feeds ?? []); ///// 여기는 임시로 [] 값 들어가도록 설정
        }
      }

      setLoading(false);
    };

    load();
  }, [rawId]);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-5">
          <div className="h-64 rounded-2xl bg-surface border border-hairline-soft animate-pulse" />
          <div className="h-64 rounded-2xl bg-surface border border-hairline-soft animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (error || !restaurant) {
    return (
      <AppShell>
        <p className="py-20 text-center text-sm text-red-500">
          {error || "식당을 찾을 수 없습니다."}
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell
      rightSidebar={
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
            <p className="text-sm font-bold text-ink mb-3">주변 추천 맛집</p>
            <p className="text-xs text-muted">추천 맛집은 준비 중입니다.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link href="/search" className="hover:text-primary">
            탐색
          </Link>
          <span>/</span>
          <Link
            href={`/search?location=${restaurant.region1}`}
            className="hover:text-primary"
          >
            {restaurant.region1}
          </Link>
          <span>/</span>
          <Link
            href={`/search?category=${restaurant.category}`}
            className="hover:text-primary"
          >
            {restaurant.category}
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{restaurant.name}</span>
        </nav>

        {/* Restaurant info */}
        <div className="rounded-2xl bg-surface border border-hairline-soft overflow-hidden shadow-sm">
          <div className="aspect-[21/9] w-full bg-surface-strong">
            <img
              src="/restaurant-placeholder.png"
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  {restaurant.category}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-ink">
                  {restaurant.name}
                </h1>
                <p className="mt-2 text-sm text-muted">
                  포스트{" "}
                  <span className="font-bold text-ink">{feeds.length}</span>개
                </p>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface-soft text-muted hover:text-primary transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-2.5 text-sm text-body">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-muted shrink-0" />
                <div>
                  <p>{restaurant.roadAddress || restaurant.address}</p>
                  {restaurant.roadAddress && (
                    <p className="text-muted-soft">{restaurant.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-muted shrink-0" />
                <p>{restaurant.phone || "전화번호 없음"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-lg font-bold text-ink mb-4">
            이 음식점의 포스트
          </h2>
          {feeds.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              아직 작성된 포스트가 없습니다.
            </p>
          ) : (
            <div className="space-y-4">
              {feeds.map((post) => (
                <article
                  key={post.feedId}
                  className="rounded-2xl bg-surface p-5 border border-hairline-soft"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/profile/${post.userId}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={post.profileImage || "/default-profile.png"}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary/30 transition-all"
                      />
                      <div>
                        <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                          {post.nickname}
                        </p>
                        <p className="text-xs text-muted-soft">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                    <button className="text-muted hover:text-ink">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-body">
                    {post.content}
                  </p>
                  <div className="mt-3 flex items-center gap-5">
                    <button className="flex items-center gap-1.5 text-sm text-muted hover:text-primary">
                      <Heart className="h-4 w-4" />
                      <span>좋아요 {post.likeCount}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted hover:text-primary">
                      <MessageCircle className="h-4 w-4" />
                      <span>댓글 {post.commentCount}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
