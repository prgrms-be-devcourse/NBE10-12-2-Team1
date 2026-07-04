"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Bookmark, GripVertical, Trash2, X } from "lucide-react";
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMoodTag, setNewMoodTag] = useState("DATE");
  const [copying, setCopying] = useState(false);
  const initialized = useRef(false);

  const moodTags = ["DATE", "FRIENDS", "FAMILY", "SOLO"];

  const loadLists = async () => {
    const [myRes, publicRes] = await Promise.all([
      apiFetchJson<ListSummary[]>("/api/v1/lists"),
      apiFetchJson<ListSummary[]>("/api/v1/lists/all"),
    ]);

    let my: ListSummary[] = [];
    if (myRes.ok && myRes.data) {
      my = myRes.data;
      setMyLists(my);
    } else {
      setError(myRes.message || "내 리스트를 불러오지 못했습니다.");
    }

    if (publicRes.ok && publicRes.data) {
      setPublicLists(publicRes.data);
    }

    return my;
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const load = async () => {
      const my = await loadLists();
      setSelectedId((prev) => (prev === null && my.length > 0 ? my[0].id : prev));
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    const isMine = myLists.some((l) => l.id === selectedId);

    const loadDetail = async () => {
      setSelectedDetail(null);
      const res = await apiFetchJson<ListDetail>(
        isMine ? `/api/v1/lists/${selectedId}` : `/api/v1/lists/all/${selectedId}`
      );
      if (res.ok && res.data) {
        setSelectedDetail(res.data);
      }
    };

    loadDetail();
  }, [selectedId, myLists]);

  const recentLists = [...publicLists].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await apiFetchJson<ListSummary>("/api/v1/lists", {
      method: "POST",
      body: JSON.stringify({
        title: newTitle.trim(),
        description: newDescription.trim(),
        moodTag: newMoodTag,
      }),
    });

    if (res.ok && res.data) {
      setNewTitle("");
      setNewDescription("");
      setNewMoodTag("DATE");
      setShowCreateModal(false);
      await loadLists();
      setSelectedId(res.data.id);
    } else {
      alert(res.message || "리스트 생성에 실패했습니다.");
    }
  };

  const handleCopy = async () => {
    if (!selectedDetail) return;
    setCopying(true);
    const res = await apiFetchJson<ListDetail>(`/api/v1/lists/${selectedDetail.listId}/copy`, {
      method: "POST",
    });
    if (res.ok) {
      await loadLists();
      if (res.data) {
        setSelectedId(res.data.listId);
      }
      alert("내 리스트에 저장되었습니다.");
    } else {
      alert(res.message || "리스트 저장에 실패했습니다.");
    }
    setCopying(false);
  };

  const handleDeleteItem = async (item: ListItem) => {
    if (!selectedDetail) return;
    if (!confirm("식당을 리스트에서 삭제할까요?")) return;

    const res = await apiFetchJson(`/api/v1/lists/${selectedDetail.listId}/items/${item.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSelectedDetail((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== item.id) } : null
      );
    } else {
      alert(res.message || "삭제에 실패했습니다.");
    }
  };

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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-active transition-colors"
          >
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
                    <button
                      onClick={handleCopy}
                      disabled={copying}
                      className="flex items-center gap-1.5 rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted hover:text-ink transition-colors disabled:opacity-70"
                    >
                      <Bookmark className="h-4 w-4" />
                      {copying ? "저장 중..." : "저장"}
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
                          <button onClick={() => handleDeleteItem(item)} className="p-1 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-hairline-soft pb-3">
              <h3 className="text-base font-bold text-ink">새 맛집 리스트</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 을지로 데이트 코스"
                  className="w-full rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 text-sm focus:border-primary focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block">설명</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="리스트에 대한 간단한 설명"
                  className="w-full rounded-xl border border-hairline bg-surface-soft px-4 py-2.5 text-sm focus:border-primary focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block">분위기</label>
                <div className="flex flex-wrap gap-2">
                  {moodTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewMoodTag(tag)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                        newMoodTag === tag
                          ? "bg-primary text-white"
                          : "bg-surface-soft text-muted hover:bg-hairline-soft"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-hairline bg-surface-soft py-2.5 text-sm font-bold text-ink hover:bg-white transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-active transition-colors"
                >
                  만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
