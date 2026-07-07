"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Bookmark, GripVertical, Trash2 } from "lucide-react";

import AppShell, { SidebarProfile, SidebarCard } from "@/components/AppShell";

import { apiFetchJson } from "@/lib/api";

/* =========================================================
 * 리스트 목록
 * ========================================================= */

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

/* =========================================================
 * 리스트 안의 식당
 * ========================================================= */

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

/* =========================================================
 * 내 리스트 상세
 * ========================================================= */

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

/* =========================================================
 * 저장한 리스트 상세
 * ========================================================= */

interface SavedListDetail {
  listId: number;
  userId: number;
  nickname: string;
  title: string;
  description: string;
  moodTag: string;
  items: ListItem[];
  savedAt: string;
}

/* =========================================================
 * 페이지
 * ========================================================= */

export default function ListsPage() {
  const router = useRouter();

  /* ---------------------------------------------------------
   * 리스트 목록
   * --------------------------------------------------------- */

  const [myLists, setMyLists] = useState<ListSummary[]>([]);

  const [publicLists, setPublicLists] = useState<ListSummary[]>([]);

  const [savedLists, setSavedLists] = useState<SavedListDetail[]>([]);

  /* ---------------------------------------------------------
   * 탭
   * --------------------------------------------------------- */

  const [activeTab, setActiveTab] = useState<"my" | "saved">("my");

  /* ---------------------------------------------------------
   * 선택한 리스트
   * --------------------------------------------------------- */

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [selectedDetail, setSelectedDetail] = useState<
    ListDetail | SavedListDetail | null
  >(null);

  /* ---------------------------------------------------------
   * 상태
   * --------------------------------------------------------- */

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [copying, setCopying] = useState(false);

  const [saving, setSaving] = useState(false);

  const initialized = useRef(false);

  /* =========================================================
   * 리스트 목록 불러오기
   * ========================================================= */

  const loadLists = async () => {
    const [myRes, publicRes, savedRes] = await Promise.all([
      apiFetchJson<ListSummary[]>("/api/v1/lists"),

      apiFetchJson<ListSummary[]>("/api/v1/lists/all"),

      apiFetchJson<{
        content: SavedListDetail[];
      }>("/api/v1/restaurant_lists/saved"),
    ]);

    let my: ListSummary[] = [];

    /* 내 리스트 */

    if (myRes.ok && myRes.data) {
      my = myRes.data;

      setMyLists(my);
    } else {
      setError(myRes.message || "내 리스트를 불러오지 못했습니다.");
    }

    /* 공개 리스트 */

    if (publicRes.ok && publicRes.data) {
      setPublicLists(publicRes.data);
    }

    /* 저장한 리스트 */

    if (savedRes.ok && savedRes.data) {
      setSavedLists(savedRes.data.content ?? []);
    }

    return my;
  };

  /* =========================================================
   * 페이지 최초 로딩
   * ========================================================= */

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    const load = async () => {
      const my = await loadLists();

      setSelectedId((prev) =>
        prev === null && my.length > 0 ? my[0].id : prev,
      );

      setLoading(false);
    };

    load();
  }, []);

  /* =========================================================
   * 선택한 리스트 상세 조회
   * ========================================================= */

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const loadDetail = async () => {
      setSelectedDetail(null);

      /* 저장한 리스트 탭 */

      if (activeTab === "saved") {
        const saved = savedLists.find((list) => list.listId === selectedId);

        if (saved) {
          setSelectedDetail(saved);
        }

        return;
      }

      /* 내 리스트인지 확인 */

      const isMine = myLists.some((list) => list.id === selectedId);

      /* 내 리스트 / 공개 리스트 상세 조회 */

      const res = await apiFetchJson<ListDetail>(
        isMine
          ? `/api/v1/lists/${selectedId}`
          : `/api/v1/lists/all/${selectedId}`,
      );

      if (res.ok && res.data) {
        setSelectedDetail(res.data);
      }
    };

    loadDetail();
  }, [selectedId, myLists, savedLists, activeTab]);

  /* =========================================================
   * 최근 생성된 리스트
   * ========================================================= */

  const recentLists = [...publicLists].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  /* =========================================================
   * 내 리스트로 복사
   * ========================================================= */

  const handleCopy = async () => {
    if (!selectedDetail) {
      return;
    }

    setCopying(true);

    const res = await apiFetchJson<ListDetail>(
      `/api/v1/lists/${selectedDetail.listId}/copy`,
      {
        method: "POST",
      },
    );

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

  /* =========================================================
   * 다른 사람 리스트 저장
   * ========================================================= */

  const handleSave = async () => {
    if (!selectedDetail) {
      return;
    }

    setSaving(true);

    const res = await apiFetchJson(
      `/api/v1/restaurant_lists/${selectedDetail.listId}/save`,
      {
        method: "POST",
      },
    );

    if (res.ok) {
      await loadLists();

      setActiveTab("saved");

      setSelectedId(selectedDetail.listId);

      alert("리스트를 저장했습니다.");
    } else {
      alert(res.message || "리스트 저장에 실패했습니다.");
    }

    setSaving(false);
  };

  /* =========================================================
   * 저장 취소
   * ========================================================= */

  const handleUnsave = async () => {
    if (!selectedDetail) {
      return;
    }

    setSaving(true);

    const res = await apiFetchJson(
      `/api/v1/restaurant_lists/${selectedDetail.listId}/save`,
      {
        method: "DELETE",
      },
    );

    if (res.ok) {
      await loadLists();

      setSelectedId(null);

      setSelectedDetail(null);

      alert("리스트 저장을 취소했습니다.");
    } else {
      alert(res.message || "저장 취소에 실패했습니다.");
    }

    setSaving(false);
  };

  /* =========================================================
   * 리스트 아이템 삭제
   * ========================================================= */

  const handleDeleteItem = async (item: ListItem) => {
    if (!selectedDetail) {
      return;
    }

    if (!confirm("식당을 리스트에서 삭제할까요?")) {
      return;
    }

    const res = await apiFetchJson(
      `/api/v1/lists/${selectedDetail.listId}/items/${item.id}`,
      {
        method: "DELETE",
      },
    );

    if (res.ok) {
      setSelectedDetail((prev) =>
        prev
          ? {
              ...prev,

              items: prev.items.filter((listItem) => listItem.id !== item.id),
            }
          : null,
      );
    } else {
      alert(res.message || "삭제에 실패했습니다.");
    }
  };

  /* =========================================================
   * 화면
   * ========================================================= */

  return (
    <AppShell
      leftSidebar={
        <div className="sticky top-28 space-y-5">
          <SidebarProfile />

          {/* 인기 맛집 리스트 */}

          <SidebarCard title="인기 맛집 리스트">
            <div className="space-y-4">
              {publicLists.slice(0, 5).map((list) => (
                <Link
                  key={list.id}
                  href={`/lists?selected=${list.id}`}
                  className="block rounded-xl bg-surface-soft p-4 transition-colors hover:bg-hairline-soft/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-ink">{list.title}</p>

                    <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                      {list.moodTag}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-muted">
                    by {list.nickname} · 식당 {list.itemCount}개
                  </p>
                </Link>
              ))}
            </div>
          </SidebarCard>

          {/* 최근 생성된 리스트 */}

          <SidebarCard title="최근 생성된 리스트">
            <div className="space-y-4">
              {recentLists.slice(0, 5).map((list) => (
                <Link
                  key={list.id}
                  href={`/lists?selected=${list.id}`}
                  className="block rounded-xl bg-surface-soft p-4 transition-colors hover:bg-hairline-soft/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-ink">{list.title}</p>

                    <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                      {list.moodTag}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-muted">
                    by {list.nickname} · 식당 {list.itemCount}개
                  </p>
                </Link>
              ))}
            </div>
          </SidebarCard>
        </div>
      }
    >
      <div className="space-y-5">
        {/* =================================================
         * 페이지 상단
         * ================================================= */}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">맛집 리스트</h2>

          {/* ===============================================
           * 중요
           *
           * 기존:
           * setShowCreateModal(true)
           *
           * 수정:
           * /lists/create 페이지로 이동
           * =============================================== */}

          <button
            type="button"
            onClick={() => router.push("/lists/create")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-active"
          >
            <Plus className="h-4 w-4" />
            리스트 만들기
          </button>
        </div>

        {/* =================================================
         * 로딩
         * ================================================= */}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl border border-hairline-soft bg-surface" />

            <div className="h-24 animate-pulse rounded-2xl border border-hairline-soft bg-surface" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
            {/* =================================================
             * 왼쪽 리스트 영역
             * ================================================= */}

            <div className="space-y-3">
              {/* 탭 */}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("my");
                    setSelectedId(null);
                    setSelectedDetail(null);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    activeTab === "my"
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:text-ink"
                  }`}
                >
                  내 리스트
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("saved");
                    setSelectedId(null);
                    setSelectedDetail(null);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    activeTab === "saved"
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:text-ink"
                  }`}
                >
                  저장한 리스트
                </button>
              </div>

              {/* =================================================
               * 내 리스트
               * ================================================= */}

              {activeTab === "my" ? (
                myLists.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">
                    등록된 리스트가 없습니다.
                  </p>
                ) : (
                  myLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => setSelectedId(list.id)}
                      className={`w-full rounded-2xl border p-5 text-left transition-all ${
                        selectedId === list.id
                          ? "border-primary bg-primary-soft/40 ring-1 ring-primary"
                          : "border-hairline-soft bg-surface hover:bg-surface-soft"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* 이미지 */}

                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-strong">
                          <img
                            src="/list-placeholder.png"
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* 정보 */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-base font-bold text-ink">
                              {list.title}
                            </p>

                            <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                              {list.moodTag}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-1 text-sm text-muted">
                            {list.description}
                          </p>

                          <div className="mt-2.5 flex items-center gap-3 text-sm text-muted-soft">
                            <span>식당 {list.itemCount}개</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )
              ) : savedLists.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  저장한 리스트가 없습니다.
                </p>
              ) : (
                /* =================================================
                 * 저장한 리스트
                 * ================================================= */

                savedLists.map((list) => (
                  <button
                    key={list.listId}
                    type="button"
                    onClick={() => setSelectedId(list.listId)}
                    className={`w-full rounded-2xl border p-5 text-left transition-all ${
                      selectedId === list.listId
                        ? "border-primary bg-primary-soft/40 ring-1 ring-primary"
                        : "border-hairline-soft bg-surface hover:bg-surface-soft"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* 이미지 */}

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-strong">
                        <img
                          src="/list-placeholder.png"
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* 정보 */}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-base font-bold text-ink">
                            {list.title}
                          </p>

                          <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                            {list.moodTag}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-1 text-sm text-muted">
                          {list.description}
                        </p>

                        <div className="mt-2.5 flex items-center gap-3 text-sm text-muted-soft">
                          <span>by {list.nickname}</span>

                          <span>·</span>

                          <span>식당 {list.items.length}개</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* =================================================
             * 오른쪽 리스트 상세
             * ================================================= */}

            <div className="min-h-[520px] rounded-2xl border border-hairline-soft bg-surface p-6">
              {selectedDetail ? (
                <>
                  {/* 상세 상단 */}

                  <div className="flex items-start justify-between gap-4 border-b border-hairline-soft pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-ink">
                          {selectedDetail.title}
                        </h3>

                        <span className="rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                          {selectedDetail.moodTag}
                        </span>
                      </div>

                      <p className="mt-1.5 text-base text-muted">
                        {selectedDetail.description}
                      </p>
                    </div>

                    {/* 버튼 영역 */}

                    <div className="flex items-center gap-2">
                      {activeTab === "saved" ? (
                        <button
                          type="button"
                          onClick={handleUnsave}
                          disabled={saving}
                          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-70"
                        >
                          <Bookmark className="h-4 w-4" />

                          {saving ? "취소 중..." : "저장 취소"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-1.5 rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-ink disabled:opacity-70"
                        >
                          <Bookmark className="h-4 w-4" />

                          {saving ? "저장 중..." : "저장"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={copying}
                        className="flex items-center gap-1.5 rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-ink disabled:opacity-70"
                      >
                        {copying ? "복사 중..." : "내 리스트로 복사"}
                      </button>
                    </div>
                  </div>

                  {/* 리스트 식당들 */}

                  <div className="mt-6 space-y-4">
                    {selectedDetail.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 rounded-xl border border-hairline-soft bg-surface-soft p-4"
                      >
                        {/* 순번 */}

                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>

                        {/* 식당 정보 */}

                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold text-ink">
                            {item.restaurantName}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-muted">
                            {item.memo}
                          </p>
                        </div>

                        {/* 수정 버튼 */}

                        <div className="flex items-center gap-1 text-muted">
                          <button
                            type="button"
                            className="p-1 hover:text-primary"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="p-1 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-20 text-center text-base text-muted">
                  리스트를 선택해주세요
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
