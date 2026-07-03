"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, MessageCircle, MoreHorizontal, Plus } from "lucide-react";
import AppShell, { SidebarProfile, SidebarCard } from "@/components/AppShell";

const recommendFoodies = [
  { id: "user5", name: "푸디맘", handle: "@foodimom", img: "user5" },
  { id: "user6", name: "카페인 중독", handle: "@cafeholic", img: "user6" },
  { id: "user7", name: "맛집 탐험가", handle: "@foodtrip", img: "user7" },
];

const feedPosts = [
  {
    id: 1,
    author: { id: "user1", name: "김푸디", img: "user1" },
    time: "방금 전",
    mood: "혼밥",
    restaurant: { name: "을지로 순대곱창", category: "한식", address: "서울 중구 을지로 156", seed: "euljiro" },
    content: "진짜 여기는 제 인생 순대곱창 집입니다. 곱창이 너무 부드럽고 순대도 쫄깃해서 매주 가고 있어요. 강추합니다!!",
    tags: ["#혼밥", "#을지로", "#순대곱창"],
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    author: { id: "user2", name: "맛탐정_소연", img: "user2" },
    time: "1시간 전",
    mood: "데이트",
    restaurant: { name: "블루보틀 삼성점", category: "카페", address: "서울 강남구 테헤란로 501", seed: "bluebottle" },
    content: "오랜만에 데이트 코스로 블루보틀 다녀왔어요. 커피도 맛있고 분위기가 너무 좋아요. 다음엔 토스트도 먹어봐야겠어요.",
    tags: ["#데이트", "#카페", "#삼성동"],
    likes: 56,
    comments: 12,
  },
  {
    id: 3,
    author: { id: "user3", name: "점심러", img: "user3" },
    time: "3시간 전",
    mood: "회식",
    restaurant: { name: "광화문 정육식당", category: "한식", address: "서울 종로구 새문안로 75", seed: "meat" },
    content: "회식으로 간 한우 오마카세. 고기 퀄리티가 미쳤습니다... 가격도 괜찮아서 다음에 또 오기로 했어요.",
    tags: ["#회식", "#한우", "#광화문"],
    likes: 89,
    comments: 23,
  },
];

const recommendedPosts = [
  {
    id: 101,
    author: { id: "user5", name: "푸디맘", img: "user5" },
    time: "30분 전",
    mood: "가족",
    restaurant: { name: "연남동 파스타", category: "양식", address: "서울 마포구 연남동 123", seed: "yeonnam" },
    content: "아이들과 함께 간 파스타집이에요. 토마토 소스가 진하고 면이 쫄깃해서 아이들이 너무 좋아했어요. 가족 단골 예약!",
    tags: ["#가족", "#연남동", "#파스타"],
    likes: 12,
    comments: 2,
  },
  {
    id: 102,
    author: { id: "user6", name: "카페인 중독", img: "user6" },
    time: "1시간 전",
    mood: "혼밥",
    restaurant: { name: "성수동 브런치카페", category: "카페", address: "서울 성동구 성수동 45", seed: "seongsu" },
    content: "성수에서 발견한 브런치 카페. 에그베네딕트가 일품이고 커피도 깔끔했어요. 혼자서 책 읽기 딱 좋은 곳이에요.",
    tags: ["#브런치", "#성수동", "#카페"],
    likes: 34,
    comments: 7,
  },
  {
    id: 103,
    author: { id: "user7", name: "맛집 탐험가", img: "user7" },
    time: "2시간 전",
    mood: "친구",
    restaurant: { name: "이태원 타코", category: "멕시코음식", address: "서울 용산구 이태원로 88", seed: "itaewon" },
    content: "이태원 타코 맛집! 살사가 신선하고 토르티야가 쫄깃해요. 친구들과 가볍게 맥주 한잔하기에 딱이에요.",
    tags: ["#타코", "#이태원", "#친구"],
    likes: 48,
    comments: 11,
  },
];

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "recommended" ? "recommended" : "following";

  const posts = activeTab === "following" ? feedPosts : recommendedPosts;

  const handleTabChange = (tab: "following" | "recommended") => {
    router.replace(`/feed?tab=${tab}`, { scroll: false });
  };

  return (
    <AppShell
      leftSidebar={
        <div className="sticky top-28 space-y-5">
          <SidebarProfile />
          <SidebarCard title="추천 푸디">
            <div className="space-y-4">
              {recommendFoodies.map((f) => (
                <Link key={f.id} href={`/profile/${f.id}`} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <img src={`https://picsum.photos/seed/${f.img}/60/60`} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-base font-bold text-ink group-hover:text-primary transition-colors">{f.name}</p>
                      <p className="text-sm text-muted-soft">{f.handle}</p>
                    </div>
                  </div>
                  <button className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-bold text-white hover:bg-primary-active transition-colors">
                    팔로우
                  </button>
                </Link>
              ))}
            </div>
          </SidebarCard>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-ink">피드</h2>
            <div className="flex items-center rounded-lg bg-surface-soft p-1">
              <button
                onClick={() => handleTabChange("following")}
                className={`rounded-md px-3 py-1 text-sm font-semibold transition-all ${
                  activeTab === "following"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                팔로잉
              </button>
              <button
                onClick={() => handleTabChange("recommended")}
                className={`rounded-md px-3 py-1 text-sm font-semibold transition-all ${
                  activeTab === "recommended"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                추천
              </button>
            </div>
          </div>
          <Link
            href="/feed/write"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-bold text-white hover:bg-primary-active transition-colors"
          >
            <Plus className="h-4 w-4" />
            글쓰기
          </Link>
        </div>

        {/* Feed cards */}
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl bg-surface p-5 border border-hairline-soft shadow-sm">
              {/* Author */}
              <div className="flex items-center justify-between">
                <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 group">
                  <img
                    src={`https://picsum.photos/seed/${post.author.img}/80/80`}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-hairline-soft group-hover:ring-primary/30 transition-colors"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors">{post.author.name}</p>
                      <span className="text-xs text-primary font-semibold">
                        {activeTab === "following" ? "팔로잉" : "추천"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-soft">{post.time}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">{post.mood}</span>
                  <button className="rounded-full p-1.5 text-muted hover:bg-surface-soft">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Restaurant card */}
              <Link href={`/restaurant/${post.id}`} className="mt-4 block rounded-xl bg-surface-soft p-3 hover:bg-hairline-soft/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-strong">
                    <img src={`https://picsum.photos/seed/${post.restaurant.seed}/100/100`} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">{post.restaurant.name}</p>
                    <p className="text-xs text-muted">{post.restaurant.address} · {post.restaurant.category}</p>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <p className="mt-4 text-sm leading-relaxed text-body">{post.content}</p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-medium text-muted">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-hairline-soft pt-3">
                <div className="flex items-center gap-5">
                  <button className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors">
                    <Heart className="h-4 w-4" />
                    <span>좋아요 {post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span>댓글 {post.comments}</span>
                  </button>
                </div>
                <span className="text-xs text-muted-soft">{post.time}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="space-y-5">
            <div className="h-10 w-40 rounded-lg bg-surface-soft animate-pulse" />
            <div className="space-y-4">
              <div className="h-64 rounded-2xl bg-surface border border-hairline-soft animate-pulse" />
              <div className="h-64 rounded-2xl bg-surface border border-hairline-soft animate-pulse" />
            </div>
          </div>
        </AppShell>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
