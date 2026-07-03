"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Bookmark, GripVertical, Trash2 } from "lucide-react";
import AppShell, { SidebarProfile, SidebarCard } from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";

interface ListSummary {
  id: number;
  userId: number;
  nickname: string;
  title: string;
  description: string;
  moodTag: string;
  itemCount: number;
  createdAt: string;
}

interface ListItem {
  id: number;
  listId: number;
  restaurantId: number;
  restaurantName: string;
  category: string;
  orderIndex: number;
  memo: string;
  createdAt: string;
}

interface ListDetail {
  listId: number;
  userId: number;
  nickname: string;
  title: string;
  description: string;
  moodTag: string;
  items: ListItem[];
  createdAt: string;
}

export default function ListsPage() {
  const [myLists, setMyLists] = useState<ListSummary[]>([]);
  const [publicLists, setPublicLists] = useState<ListSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const [myRes, publicRes] = await Promise.all([
        apiFetchJson<ListSummary[]>("/api/v1/lists"),
        apiFetchJson<ListSummary[]>("/api/v1/lists/all"),
      ]);

      if (myRes.ok && myRes.data) {
        setMyLists(myRes.data);
        if (myRes.data.length > 0 && selectedId === null) {
          setSelectedId(myRes.data[0].id);
        }
      } else {
        setError(myRes.message || "내 리스트를 불러오지 못했습니다.");
      }

      if (publicRes.ok && publicRes.data) {
        setPublicLists(publicRes.data);
      }

      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    const loadDetail = async () => {
      setSelectedDetail(null);
      const res = await apiFetchJson<ListDetail>(`/api/v1/lists/all/${selectedId}`);
      if (res.ok && res.data) {
        setSelectedDetail(res.data);
      }
    };

    loadDetail();
  }, [selectedId]);

  const recentLists = [...publicLists].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <AppShell
      leftSidebar={
        <div className="sticky top-28 space-y-5">
          <SidebarProfile />
          <SidebarCard title="인기 맛집 리스트">
            <div className="space-y-4">
              {publicLists.slice(0, 5).map((l) => (
                <Link key={l.id} href={`/lists?selected=${l.id}`} className="block rounded-xl bg-surface-soft p-4 hover:bg-hairline-soft/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-ink">{l.title}</p>
                    <span className="rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink shrink-0">{l.moodTag}</span>
                  </div>
                  <p className="text-sm text-muted mt-1.5">by {l.nickname} · 식당 {l.itemCount}개</p>
                </Link>
              ))}
            </div>
          </SidebarCard>
          <SidebarCard title="최근 생성된 리스트">
            <div className="space-y-4">
              {recentLists.slice(0, 5).map((l) => (
                <Link key={l.id} href={`/lists?selected=${l.id}`} className="block rounded-xl bg-surface-soft p-4 hover:bg-hairline-soft/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-ink">{l.title}</p>
                    <span className="rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink shrink-0">{l.moodTag}</span>
                  </div>
                  <p className="text-sm text-muted mt-1.5">by {l.nickname} · 식당 {l.itemCount}개</p>
                </Link>
              ))}
            </div>
          </SidebarCard>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">맛집 리스트</h2>
          <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-active transition-colors">
            <Plus className="h-4 w-4" />
            리스트 만들기
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 rounded-2xl bg-surface border border-hairline-soft animate-pulse" />
            <div className="h-24 rounded-2xl bg-surface border border-hairline-soft animate-pulse" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
            {/* My lists */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-muted">내 리스트</p>
              {myLists.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">등록된 리스트가 없습니다.</p>
              ) : (
                myLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedId(list.id)}
                    className={`w-full rounded-2xl border p-5 text-left transition-all ${
                      selectedId === list.id
                        ? "border-primary bg-primary-soft/40 ring-1 ring-primary"
                        : "border-hairline-soft bg-surface hover:bg-surface-soft"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-strong">
                        <img
                          src={`https://picsum.photos/seed/${list.id}/120/120`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-base font-bold text-ink truncate">{list.title}</p>
                          <span className="rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink shrink-0">{list.moodTag}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted line-clamp-1">{list.description}</p>
                        <div className="mt-2.5 flex items-center gap-3 text-sm text-muted-soft">
                          <span>식당 {list.itemCount}개</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Selected list detail */}
            <div className="rounded-2xl bg-surface p-6 border border-hairline-soft min-h-[520px]">
              {selectedDetail ? (
                <>
                  <div className="flex items-start justify-between gap-4 border-b border-hairline-soft pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-ink">{selectedDetail.title}</h3>
                        <span className="rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">{selectedDetail.moodTag}</span>
                      </div>
                      <p className="mt-1.5 text-base text-muted">{selectedDetail.description}</p>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted hover:text-ink transition-colors">
                      <Bookmark className="h-4 w-4" />
                      저장
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {selectedDetail.items.map((item, idx) => (
                      <div key={item.id} className="flex items-start gap-4 rounded-xl border border-hairline-soft bg-surface-soft p-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-ink">{item.restaurantName}</p>
                          <p className="mt-1 text-sm text-muted line-clamp-2">{item.memo}</p>
                        </div>
                        <div className="flex items-center gap-1 text-muted">
                          <button className="p-1 hover:text-primary"><GripVertical className="h-4 w-4" /></button>
                          <button className="p-1 hover:text-primary"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-20 text-center text-base text-muted">리스트를 선택해주세요</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
