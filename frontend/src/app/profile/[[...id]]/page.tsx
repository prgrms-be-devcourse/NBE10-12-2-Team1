"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Settings, Users, UserPlus, X, UserMinus } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";
import { getStoredUser } from "@/lib/user";

const tabs = ["내 리스트", "포스트", "저장함"];

interface UserProfile {
  id: number;
  nickname: string;
  profileImage: string | null;
  email: string;
  provider: "LOCAL" | "KAKAO";
  createdAt: string;
  ownProfile: boolean;
  following: boolean;
}

interface FollowUser {
  id: number;
  nickname: string;
  profileImage: string | null;
  isFollowedByMe: boolean;
}

interface ProfileList {
  id: number;
  title: string;
  description: string;
  moodTag: string;
  itemCount: number;
}

interface FeedListPageResponse {
  feeds: {
    feedId: number;
    content: string;
    nickname: string;
    likeCount: number;
    createdAt: string;
  }[];
}

interface SavedList {
  listId: number;
  nickname: string;
  title: string;
  description: string;
  moodTag: string;
  items: unknown[];
  savedAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const rawId = params.id;
  const paramId = Array.isArray(rawId) ? rawId[0] : rawId;
  const targetUserId = paramId ? Number(paramId) : getStoredUser()?.userId;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("내 리스트");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowings, setShowFollowings] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [myLists, setMyLists] = useState<ProfileList[]>([]);
  const [myPosts, setMyPosts] = useState<FeedListPageResponse["feeds"]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!targetUserId) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const [profileRes, countRes] = await Promise.all([
        apiFetchJson<UserProfile>(`/api/v1/users/${targetUserId}`),
        apiFetchJson<{ userId: number; followerCount: number; followingCount: number }>(
          `/api/v1/follows/users/${targetUserId}/count`
        ),
      ]);

      if (profileRes.ok && profileRes.data) {
        setUser(profileRes.data);
        setIsFollowing(profileRes.data.following);
      } else {
        setError(profileRes.message || "프로필을 불러오지 못했습니다.");
      }

      if (countRes.ok && countRes.data) {
        setFollowerCount(countRes.data.followerCount);
        setFollowingCount(countRes.data.followingCount);
      }

      setLoading(false);
    };

    load();
  }, [targetUserId]);

  useEffect(() => {
    if (!targetUserId || !user) return;

    const loadTab = async () => {
      setTabLoading(true);

      if (activeTab === "내 리스트" && user.ownProfile) {
        const res = await apiFetchJson<ProfileList[]>("/api/v1/lists");
        if (res.ok && res.data) {
          setMyLists(res.data);
        }
      } else if (activeTab === "포스트") {
        const res = await apiFetchJson<FeedListPageResponse>(`/api/v1/feeds?userId=${targetUserId}`);
        if (res.ok && res.data) {
          setMyPosts(res.data.feeds);
        }
      } else if (activeTab === "저장함" && user.ownProfile) {
        const res = await apiFetchJson<{ content: SavedList[] }>("/api/v1/restaurant_lists/saved");
        if (res.ok && res.data) {
          setSavedLists(res.data.content);
        }
      }

      setTabLoading(false);
    };

    loadTab();
  }, [activeTab, targetUserId, user]);

  const handleFollowToggle = async () => {
    if (!user || user.ownProfile) return;

    setFollowLoading(true);

    const res = isFollowing
      ? await apiFetchJson(`/api/v1/follows/${user.id}`, { method: "DELETE" })
      : await apiFetchJson(`/api/v1/follows/${user.id}`, { method: "POST" });

    if (res.ok) {
      setIsFollowing(!isFollowing);
    } else {
      alert(res.message || "팔로우 처리에 실패했습니다.");
    }

    setFollowLoading(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (error || !user) {
    return (
      <AppShell>
        <p className="py-20 text-center text-sm text-red-500">{error || "프로필을 불러오지 못했습니다."}</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Profile header */}
        <div className="rounded-2xl bg-surface p-6 border border-hairline-soft shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <img
                src={user.profileImage || "/default-profile.png"}
                alt="프로필"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/15"
              />
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-ink">{user.nickname}</h1>
                <p className="text-sm text-muted">{user.email}</p>
                <p className="text-xs text-muted-soft mt-1">
                  {user.provider === "KAKAO" ? "카카오 로그인" : "이메일 로그인"}
                </p>
                <div className="mt-3 flex gap-4 text-sm">
                  <button onClick={() => setShowFollowers(true)} className="flex items-center gap-1.5 text-body hover:text-primary transition-colors font-medium">
                    <Users className="h-4 w-4 text-muted" />
                    팔로워 <span className="font-bold text-ink">{followerCount ?? "-"}</span>
                  </button>
                  <button onClick={() => setShowFollowings(true)} className="flex items-center gap-1.5 text-body hover:text-primary transition-colors font-medium">
                    <UserPlus className="h-4 w-4 text-muted" />
                    팔로잉 <span className="font-bold text-ink">{followingCount ?? "-"}</span>
                  </button>
                </div>
              </div>
            </div>
            {user.ownProfile && (
              <Link href="/profile/edit" className="rounded-full border border-hairline bg-surface-soft p-2 text-muted hover:text-ink">
                <Settings className="h-5 w-5" />
              </Link>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {user.ownProfile ? (
              <Link
                href="/profile/edit"
                className="rounded-full border border-hairline bg-surface-soft px-4 py-2 text-sm font-bold text-ink hover:bg-white transition-colors"
              >
                프로필 수정
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
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
          {tabLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {activeTab === "내 리스트" && (
                <>
                  {user && !user.ownProfile ? (
                    <p className="py-10 text-center text-sm text-muted">다른 사용자의 리스트는 조회할 수 없습니다.</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {myLists.map((list) => (
                        <div key={list.id} className="overflow-hidden rounded-2xl border border-hairline-soft bg-surface shadow-sm">
                          <div className="h-36 bg-surface-strong">
                            <img src="/list-placeholder.png" alt={list.title} className="h-full w-full object-cover" />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold text-ink">{list.title}</h3>
                              <span className="rounded-full bg-tag-mood px-2 py-0.5 text-[10px] font-bold text-ink">{list.moodTag}</span>
                            </div>
                            <div className="mt-2 text-xs text-muted-soft">
                              <span>식당 {list.itemCount}개</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "포스트" && (
                <div className="space-y-4">
                  {myPosts.map((post) => (
                    <article key={post.feedId} className="rounded-2xl border border-hairline-soft bg-surface p-5">
                      <p className="text-sm leading-6 text-body">{post.content}</p>
                      <p className="mt-2 text-xs text-muted-soft">
                        좋아요 {post.likeCount} · {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === "저장함" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedLists.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted">저장한 리스트가 없습니다.</p>
                  ) : (
                    savedLists.map((list) => (
                      <div key={list.listId} className="overflow-hidden rounded-2xl border border-hairline-soft bg-surface shadow-sm">
                        <div className="h-36 bg-surface-strong">
                          <img src={`/list-placeholder.png`} alt={list.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-ink">{list.title}</h3>
                            <span className="rounded-full bg-tag-mood px-2 py-0.5 text-[10px] font-bold text-ink">{list.moodTag}</span>
                          </div>
                          <p className="text-xs text-muted mt-1">by {list.nickname}</p>
                          <div className="mt-2 text-xs text-muted-soft">
                            <span>식당 {list.items.length}개</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Followers modal */}
        {showFollowers && targetUserId && (
          <FollowListModal title="팔로워 목록" type="followers" userId={targetUserId} onClose={() => setShowFollowers(false)} />
        )}
        {showFollowings && targetUserId && (
          <FollowListModal title="팔로잉 목록" type="followings" userId={targetUserId} onClose={() => setShowFollowings(false)} />
        )}
      </div>
    </AppShell>
  );
}

interface FollowListModalProps {
  title: string;
  type: "followers" | "followings";
  userId: number;
  onClose: () => void;
}

function FollowListModal({ title, type, userId, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const endpoint = type === "followers" ? `/api/v1/follows/users/${userId}/followers` : `/api/v1/follows/users/${userId}/followings`;

  useEffect(() => {
    let cancelled = false;
    apiFetchJson<{ content: FollowUser[] }>(endpoint).then((res) => {
      if (cancelled) return;
      if (res.ok && res.data) {
        setUsers(res.data.content);
      } else {
        setError(res.message || "목록을 불러오지 못했습니다.");
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  const handleToggle = async (targetUserId: number, currentlyFollowing: boolean) => {
    const res = await apiFetchJson(`/api/v1/follows/${targetUserId}`, {
      method: currentlyFollowing ? "DELETE" : "POST",
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, isFollowedByMe: !currentlyFollowing } : u))
      );
    } else {
      alert(res.message || "팔로우 처리에 실패했습니다.");
    }
  };

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
          {loading ? (
            <li className="py-6 text-center text-sm text-muted">불러오는 중...</li>
          ) : error ? (
            <li className="py-6 text-center text-sm text-red-500">{error}</li>
          ) : users.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted">목록이 비어있습니다.</li>
          ) : (
            users.map((f) => (
              <li key={f.id} className="flex items-center justify-between">
                <Link href={`/profile/${f.id}`} onClick={onClose} className="flex items-center gap-3">
                  <img
                    src={f.profileImage || "/default-profile.png"}
                    alt={f.nickname}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span className="text-sm font-bold text-ink hover:text-primary">{f.nickname}</span>
                </Link>
                <button
                  onClick={() => handleToggle(f.id, f.isFollowedByMe)}
                  className="flex items-center gap-1 rounded-full bg-surface-soft px-3 py-1 text-xs font-bold text-muted hover:text-primary"
                >
                  <UserMinus className="h-3 w-3" />
                  {f.isFollowedByMe ? "언팔로우" : "팔로우"}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
