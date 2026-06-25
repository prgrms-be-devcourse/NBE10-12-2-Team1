"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Settings, Users, UserPlus, Bookmark, X, UserMinus } from "lucide-react";
import AppShell from "@/components/AppShell";

const tabs = ["내 리스트", "포스트", "저장함"];

const currentUser = {
  id: "me",
  name: "오늘의푸디",
  handle: "@todayfoodie",
  email: "foodie@example.com",
  image: "https://picsum.photos/seed/myprofile/120/120",
  followers: 342,
  followings: 128,
};

const otherUsers: Record<string, { name: string; handle: string; email?: string; image: string; followers: number; followings: number }> = {
  user1: { name: "김푸디", handle: "@kimfoodie", image: "https://picsum.photos/seed/user1/120/120", followers: 892, followings: 45 },
  user2: { name: "맛탐정_소연", handle: "@sotaste", image: "https://picsum.photos/seed/user2/120/120", followers: 234, followings: 67 },
  user3: { name: "혼밥러", handle: "@honbap", image: "https://picsum.photos/seed/user3/120/120", followers: 567, followings: 89 },
  user4: { name: "점심러", handle: "@lunchhunter", image: "https://picsum.photos/seed/user4/120/120", followers: 123, followings: 34 },
  user5: { name: "푸디맘", handle: "@foodimom", image: "https://picsum.photos/seed/user5/120/120", followers: 1204, followings: 156 },
  user6: { name: "카페인 중독", handle: "@cafeholic", image: "https://picsum.photos/seed/user6/120/120", followers: 445, followings: 78 },
  user7: { name: "맛집 탐험가", handle: "@foodtrip", image: "https://picsum.photos/seed/user7/120/120", followers: 678, followings: 123 },
};

const myLists = [
  { id: 1, title: "을지로 데이트 코스", itemCount: 4, savedCount: 23, coverSeed: "date", moodTag: "데이트" },
  { id: 2, title: "혼밥 명당", itemCount: 7, savedCount: 5, coverSeed: "solo", moodTag: "혼밥" },
];

const myPosts = [
  { id: 1, restaurant: "을지로 칼국수", content: "면속 위로를 뜨거운 칼국수. 면이 최고였어요.", date: "2026-06-10" },
  { id: 2, restaurant: "광화문 정육식당", content: "회식으로 가기 좋은 한우 오마카세", date: "2026-06-05" },
];

const savedLists = [
  { id: 3, title: "홍대 회식 추천", author: "푸디맘", itemCount: 6, savedCount: 45, coverSeed: "hongdae", moodTag: "회식" },
  { id: 4, title: "망원동 카페 투어", author: "카페인 중독", itemCount: 5, savedCount: 128, coverSeed: "cafe", moodTag: "데이트" },
];

export default function ProfilePage() {
  const params = useParams();
  const rawId = params.id;
  const userId = Array.isArray(rawId) ? rawId[0] : rawId;
  const isMe = !userId || userId === "me";
  const user = isMe ? currentUser : otherUsers[userId] || currentUser;

  const [activeTab, setActiveTab] = useState("내 리스트");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers);
  const [followingsCount] = useState(user.followings);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowings, setShowFollowings] = useState(false);

  useEffect(() => {
    setFollowersCount(user.followers);
  }, [user.followers]);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Profile header */}
        <div className="rounded-2xl bg-surface p-6 border border-hairline-soft shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <img
                src={user.image}
                alt="프로필"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/15"
              />
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-ink">{user.name}</h1>
                <p className="text-sm text-muted">{isMe ? user.email : user.handle}</p>
                <div className="mt-3 flex gap-4 text-sm">
                  <button onClick={() => setShowFollowers(true)} className="flex items-center gap-1.5 text-body hover:text-primary transition-colors font-medium">
                    <Users className="h-4 w-4 text-muted" />
                    팔로워 <span className="font-bold text-ink">{followersCount}</span>
                  </button>
                  <button onClick={() => setShowFollowings(true)} className="flex items-center gap-1.5 text-body hover:text-primary transition-colors font-medium">
                    <UserPlus className="h-4 w-4 text-muted" />
                    팔로잉 <span className="font-bold text-ink">{followingsCount}</span>
                  </button>
                </div>
              </div>
            </div>
            {isMe && (
              <button className="rounded-full border border-hairline bg-surface-soft p-2 text-muted hover:text-ink">
                <Settings className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {isMe ? (
              <button className="rounded-full border border-hairline bg-surface-soft px-4 py-2 text-sm font-bold text-ink hover:bg-white transition-colors">
                프로필 수정
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                  isFollowing ? "bg-surface-strong text-ink hover:bg-hairline" : "bg-primary text-white hover:bg-primary-active"
                }`}
              >
                {isFollowing ? "팔로잉" : "팔로우"}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-hairline-soft">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-bold transition-colors ${
                activeTab === tab ? "text-primary" : "text-muted hover:text-ink"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "내 리스트" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {myLists.map((list) => (
                <div key={list.id} className="overflow-hidden rounded-2xl border border-hairline-soft bg-surface shadow-sm">
                  <div className="h-36 bg-surface-strong">
                    <img src={`https://picsum.photos/seed/${list.coverSeed}/400/220`} alt={list.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-ink">{list.title}</h3>
                      <span className="rounded-full bg-tag-mood px-2 py-0.5 text-[10px] font-bold text-ink">{list.moodTag}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-soft">
                      <span>식당 {list.itemCount}개</span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {list.savedCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "포스트" && (
            <div className="space-y-4">
              {myPosts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-hairline-soft bg-surface p-5">
                  <h3 className="text-base font-bold text-ink">{post.restaurant}</h3>
                  <p className="mt-2 text-sm leading-6 text-body">{post.content}</p>
                  <p className="mt-2 text-xs text-muted-soft">{post.date}</p>
                </article>
              ))}
            </div>
          )}

          {activeTab === "저장함" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedLists.map((list) => (
                <div key={list.id} className="overflow-hidden rounded-2xl border border-hairline-soft bg-surface shadow-sm">
                  <div className="h-36 bg-surface-strong">
                    <img src={`https://picsum.photos/seed/${list.coverSeed}/400/220`} alt={list.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-ink">{list.title}</h3>
                      <span className="rounded-full bg-tag-mood px-2 py-0.5 text-[10px] font-bold text-ink">{list.moodTag}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">by {list.author}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-soft">
                      <span>식당 {list.itemCount}개</span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {list.savedCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Followers modal */}
        {showFollowers && <FollowListModal title="팔로워 목록" onClose={() => setShowFollowers(false)} />}
        {showFollowings && <FollowListModal title="팔로잉 목록" onClose={() => setShowFollowings(false)} />}
      </div>
    </AppShell>
  );
}

function FollowListModal({ title, onClose }: { title: string; onClose: () => void }) {
  const users = [
    { id: 1, nickname: "서교동김푸디", profileImage: "https://picsum.photos/seed/user2/80/80" },
    { id: 2, nickname: "망원동고독가", profileImage: "https://picsum.photos/seed/user3/80/80" },
    { id: 3, nickname: "맛집 사냥꾼", profileImage: "https://picsum.photos/seed/user4/80/80" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in-50">
      <div className="w-full max-w-sm rounded-2xl border border-hairline-soft bg-surface p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-hairline-soft pb-3">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-muted hover:bg-surface-soft">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="mt-4 max-h-60 overflow-y-auto space-y-3">
          {users.map((f) => (
            <li key={f.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={f.profileImage} alt={f.nickname} className="h-9 w-9 rounded-full object-cover" />
                <span className="text-sm font-bold text-ink">{f.nickname}</span>
              </div>
              <button className="flex items-center gap-1 rounded-full bg-surface-soft px-3 py-1 text-xs font-bold text-muted hover:text-primary">
                <UserMinus className="h-3 w-3" />
                {title === "팔로워 목록" ? "삭제" : "언팔로우"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
