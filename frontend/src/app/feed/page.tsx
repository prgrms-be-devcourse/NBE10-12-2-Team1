"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, MoreHorizontal, Plus } from "lucide-react";
import AppShell from "@/components/AppShell";

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

export default function FeedPage() {
  const [sortBy, setSortBy] = useState("최신순");

  return (
    <AppShell rightSidebar={<RightSidebar />}>
      <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">팔로잉 피드</h2>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-hidden"
          >
            <option>최신순</option>
            <option>인기순</option>
          </select>
          <Link
            href="/feed/write"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-bold text-white hover:bg-primary-active transition-colors"
          >
            <Plus className="h-4 w-4" />
            글쓰기
          </Link>
        </div>
      </div>

      {/* Feed cards */}
      <div className="space-y-4">
        {feedPosts.map((post) => (
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
                    <span className="text-xs text-primary font-semibold">팔로잉</span>
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

export function RightSidebar() {
  return (
    <div className="space-y-5">
      {/* Recommend Foodies */}
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

      {/* Hot Places */}
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
