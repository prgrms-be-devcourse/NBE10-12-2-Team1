"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import AppShell from "@/components/AppShell";

const restaurant = {
  name: "을지로 순대곱창",
  category: "한식",
  address: "서울 중구 을지로 156",
  roadAddress: "서울 중구 을지로12길 5",
  phone: "02-1234-5678",
  postCount: 128,
  seed: "euljiro",
};

const posts = [
  {
    id: 1,
    author: { id: "user1", name: "김푸디", img: "user1" },
    time: "방금 전",
    content: "진짜 여기는 제 인생 순대곱창 집입니다. 곱창이 너무 부드럽고 순대도 쫄깃해서 매주 가고 있어요. 강추합니다!!",
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    author: { id: "user2", name: "맛탐정_소연", img: "user2" },
    time: "1시간 전",
    content: "점심 특선 가성비가 최고에요. 고기도 많고 국물도 시원해요.",
    likes: 18,
    comments: 3,
  },
  {
    id: 3,
    author: { id: "user3", name: "점심러", img: "user3" },
    time: "3시간 전",
    content: "직장인들이 많아서 12시 10분 전에 가야 해요. 맛은 확실합니다.",
    likes: 12,
    comments: 8,
  },
];

const nearbyRestaurants = [
  { name: "을지로 칼국수", category: "한식", seed: "kalguksu" },
  { name: "을지로 돼지국밥", category: "한식", seed: "porkrice" },
  { name: "종로3가 둥자탕", category: "분식", seed: "dumpling" },
];

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id;

  return (
    <AppShell
      rightSidebar={
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface p-4 border border-hairline-soft">
            <p className="text-sm font-bold text-ink mb-3">주변 추천 맛집</p>
            <div className="space-y-3">
              {nearbyRestaurants.map((r) => (
                <Link key={r.name} href={`/restaurant/${r.seed}`} className="flex items-start gap-3 group">
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-surface-strong overflow-hidden">
                    <img src={`https://picsum.photos/seed/${r.seed}/100/100`} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors">{r.name}</p>
                    <p className="text-xs text-muted">{r.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link href="/search" className="hover:text-primary">탐색</Link>
          <span>/</span>
          <Link href="/search?location=서울" className="hover:text-primary">서울</Link>
          <span>/</span>
          <Link href="/search?category=한식" className="hover:text-primary">한식</Link>
          <span>/</span>
          <span className="text-ink font-medium">음식점</span>
        </nav>

        {/* Restaurant info */}
        <div className="rounded-2xl bg-surface border border-hairline-soft overflow-hidden shadow-sm">
          <div className="aspect-[21/9] w-full bg-surface-strong">
            <img
              src={`https://picsum.photos/seed/${restaurant.seed}/800/340`}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">{restaurant.category}</p>
                <h1 className="mt-1 text-2xl font-bold text-ink">{restaurant.name}</h1>
                <p className="mt-2 text-sm text-muted">
                  포스트 <span className="font-bold text-ink">{restaurant.postCount}</span>개
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
                  <p>{restaurant.roadAddress}</p>
                  <p className="text-muted-soft">{restaurant.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-muted shrink-0" />
                <p>{restaurant.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-lg font-bold text-ink mb-4">이 음식점의 포스트</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl bg-surface p-5 border border-hairline-soft">
                <div className="flex items-center justify-between">
                  <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 group">
                    <img
                      src={`https://picsum.photos/seed/${post.author.img}/80/80`}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary/30 transition-all"
                    />
                    <div>
                      <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors">{post.author.name}</p>
                      <p className="text-xs text-muted-soft">{post.time}</p>
                    </div>
                  </Link>
                  <button className="text-muted hover:text-ink">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-body">{post.content}</p>
                <div className="mt-3 flex items-center gap-5">
                  <button className="flex items-center gap-1.5 text-sm text-muted hover:text-primary">
                    <Heart className="h-4 w-4" />
                    <span>좋아요 {post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted hover:text-primary">
                    <MessageCircle className="h-4 w-4" />
                    <span>댓글 {post.comments}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
