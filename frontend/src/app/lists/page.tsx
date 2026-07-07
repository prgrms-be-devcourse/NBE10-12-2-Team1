"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, GripVertical, Plus, Trash2 } from "lucide-react";

import AppShell, { SidebarCard, SidebarProfile } from "@/components/AppShell";

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
 * 내 리스트 / 공개 리스트 상세
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
 * 현재 탭
 * ========================================================= */

type ActiveTab = "my" | "saved" | "public";

/* =========================================================
 * 페이지
 * ========================================================= */

export default function ListsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const selectedParam = searchParams.get("selected");

  /* =======================================================
   * 리스트 목록
   * ======================================================= */

  const [myLists, setMyLists] = useState<ListSummary[]>([]);

  const [publicLists, setPublicLists] = useState<ListSummary[]>([]);

  const [savedLists, setSavedLists] = useState<SavedListDetail[]>([]);

  /* =======================================================
   * 현재 탭
   * ======================================================= */

  const [activeTab, setActiveTab] = useState<ActiveTab>("my");

  /* =======================================================
   * 선택한 리스트
   * ======================================================= */

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [selectedDetail, setSelectedDetail] = useState<
    ListDetail | SavedListDetail | null
  >(null);

  /* =======================================================
   * 상태
   * ======================================================= */

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [copying, setCopying] = useState(false);

  const [saving, setSaving] = useState(false);

  const initialized = useRef(false);

  /* =========================================================
   * 리스트 목록 전체 조회
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
   * 최초 로딩
   * ========================================================= */

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    const load = async () => {
      try {
        const my = await loadLists();

        /**
         * selected 파라미터가 없을 때만
         * 첫 번째 내 리스트 자동 선택
         */
        if (!selectedParam && my.length > 0) {
          setActiveTab("my");

          setSelectedId(my[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  /* =========================================================
   * 다른 사람 리스트
   *
   * 전체 공개 리스트에서
   * 내 리스트 제외
   * ========================================================= */

  const otherUserLists = publicLists.filter(
    (publicList) => !myLists.some((myList) => myList.id === publicList.id),
  );

  /* =========================================================
   * URL selected 파라미터 반영
   *
   * 중요:
   * 같은 리스트를 다시 클릭한 경우
   * selectedDetail을 null로 만들지 않음
   * ========================================================= */

  useEffect(() => {
    if (!selectedParam) {
      return;
    }

    if (loading) {
      return;
    }

    const listId = Number(selectedParam);

    if (Number.isNaN(listId)) {
      return;
    }

    const mine = myLists.some((list) => list.id === listId);

    const nextTab: ActiveTab = mine ? "my" : "public";

    const sameSelection = activeTab === nextTab && selectedId === listId;

    /**
     * 다른 리스트로 이동할 때만
     * 이전 상세 제거
     */
    if (!sameSelection) {
      setSelectedDetail((prev) => (prev?.listId === listId ? prev : null));
    }

    setActiveTab(nextTab);

    setSelectedId(listId);
  }, [selectedParam, myLists, loading]);

  /* =========================================================
   * 선택한 리스트 상세 조회
   * ========================================================= */

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      /**
       * 새 리스트를 선택했을 때만
       * 이전 리스트 상세 제거
       *
       * 같은 리스트를 다시 눌렀다면 유지
       */
      setSelectedDetail((prev) => (prev?.listId === selectedId ? prev : null));

      /* -----------------------------------------------------
       * 저장한 리스트
       * ----------------------------------------------------- */

      if (activeTab === "saved") {
        const saved = savedLists.find((list) => list.listId === selectedId);

        if (!cancelled && saved) {
          setSelectedDetail(saved);
        }

        return;
      }

      /* -----------------------------------------------------
       * 내 리스트
       * ----------------------------------------------------- */

      if (activeTab === "my") {
        const res = await apiFetchJson<ListDetail>(
          `/api/v1/lists/${selectedId}`,
        );

        if (!cancelled && res.ok && res.data) {
          setSelectedDetail(res.data);
        }

        return;
      }

      /* -----------------------------------------------------
       * 다른 사람 공개 리스트
       * ----------------------------------------------------- */

      const res = await apiFetchJson<ListDetail>(
        `/api/v1/lists/all/${selectedId}`,
      );

      if (!cancelled && res.ok && res.data) {
        setSelectedDetail(res.data);
      }
    };

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedId, savedLists, activeTab]);

  /* =========================================================
   * 최근 생성 리스트
   * ========================================================= */

  const recentLists = [...publicLists].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  /* =========================================================
   * 선택한 리스트가 내 리스트인지
   * ========================================================= */

  const isOwner =
    activeTab === "my" &&
    selectedId !== null &&
    myLists.some((list) => list.id === selectedId);

  /* =========================================================
   * 식당 orderIndex 정렬
   * ========================================================= */

  const sortedSelectedItems = selectedDetail
    ? [...selectedDetail.items].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];

  /* =========================================================
   * 내 리스트 선택
   *
   * 같은 리스트 재클릭 시
   * 상세를 비우지 않음
   * ========================================================= */

  const handleSelectMyList = (listId: number) => {
    const sameSelection = activeTab === "my" && selectedId === listId;

    if (!sameSelection) {
      setSelectedDetail(null);
    }

    setActiveTab("my");

    setSelectedId(listId);

    router.replace(`/lists?selected=${listId}`);
  };

  /* =========================================================
   * 다른 사람 리스트 선택
   * ========================================================= */

  const handleSelectPublicList = (listId: number) => {
    const sameSelection = activeTab === "public" && selectedId === listId;

    if (!sameSelection) {
      setSelectedDetail(null);
    }

    setActiveTab("public");

    setSelectedId(listId);

    router.replace(`/lists?selected=${listId}`);
  };

  /* =========================================================
   * 저장한 리스트 선택
   * ========================================================= */

  const handleSelectSavedList = (listId: number) => {
    const sameSelection = activeTab === "saved" && selectedId === listId;

    if (!sameSelection) {
      setSelectedDetail(null);
    }

    setActiveTab("saved");

    setSelectedId(listId);

    router.replace("/lists");
  };

  /* =========================================================
   * 왼쪽 인기 / 최근 리스트 선택
   * ========================================================= */

  const handleSelectSidebarList = (listId: number) => {
    const mine = myLists.some((list) => list.id === listId);

    const nextTab: ActiveTab = mine ? "my" : "public";

    const sameSelection = activeTab === nextTab && selectedId === listId;

    /**
     * 다른 리스트일 때만 상세 제거
     */
    if (!sameSelection) {
      setSelectedDetail(null);
    }

    setActiveTab(nextTab);

    setSelectedId(listId);

    router.replace(`/lists?selected=${listId}`);
  };

  /* =========================================================
   * 내 리스트 탭
   * ========================================================= */

  const handleSelectMyTab = () => {
    if (activeTab !== "my") {
      setSelectedDetail(null);
    }

    setActiveTab("my");

    router.replace("/lists");

    if (myLists.length > 0) {
      setSelectedId(myLists[0].id);
    } else {
      setSelectedId(null);
    }
  };

  /* =========================================================
   * 저장한 리스트 탭
   * ========================================================= */

  const handleSelectSavedTab = () => {
    if (activeTab !== "saved") {
      setSelectedDetail(null);
    }

    setActiveTab("saved");

    router.replace("/lists");

    if (savedLists.length > 0) {
      setSelectedId(savedLists[0].listId);
    } else {
      setSelectedId(null);
    }
  };

  /* =========================================================
   * 다른 사람 리스트 탭
   * ========================================================= */

  const handleSelectPublicTab = () => {
    if (activeTab !== "public") {
      setSelectedDetail(null);
    }

    setActiveTab("public");

    if (otherUserLists.length > 0) {
      const firstId = otherUserLists[0].id;

      setSelectedId(firstId);

      router.replace(`/lists?selected=${firstId}`);
    } else {
      setSelectedId(null);

      router.replace("/lists");
    }
  };

  /* =========================================================
   * 내 리스트로 복사
   * ========================================================= */

  const handleCopy = async () => {
    if (!selectedDetail) {
      return;
    }

    setCopying(true);

    try {
      const res = await apiFetchJson<ListDetail>(
        `/api/v1/lists/${selectedDetail.listId}/copy`,
        {
          method: "POST",
        },
      );

      if (res.ok) {
        const refreshedMy = await loadLists();

        setActiveTab("my");

        if (res.data) {
          setSelectedId(res.data.listId);

          setSelectedDetail(res.data);

          router.replace(`/lists?selected=${res.data.listId}`);
        } else if (refreshedMy.length > 0) {
          setSelectedId(refreshedMy[0].id);
        }

        alert("내 리스트에 복사되었습니다.");
      } else {
        alert(res.message || "리스트 복사에 실패했습니다.");
      }
    } finally {
      setCopying(false);
    }
  };

  /* =========================================================
   * 다른 사람 리스트 저장
   * ========================================================= */

  const handleSave = async () => {
    if (!selectedDetail) {
      return;
    }

    setSaving(true);

    try {
      const res = await apiFetchJson(
        `/api/v1/restaurant_lists/${selectedDetail.listId}/save`,
        {
          method: "POST",
        },
      );

      if (res.ok) {
        await loadLists();

        alert("리스트를 저장했습니다.");
      } else {
        alert(res.message || "리스트 저장에 실패했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
   * 저장 취소
   * ========================================================= */

  const handleUnsave = async () => {
    if (!selectedDetail) {
      return;
    }

    setSaving(true);

    try {
      const res = await apiFetchJson(
        `/api/v1/restaurant_lists/${selectedDetail.listId}/save`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        const targetId = selectedDetail.listId;

        const nextSavedLists = savedLists.filter(
          (list) => list.listId !== targetId,
        );

        await loadLists();

        if (nextSavedLists.length > 0) {
          setSelectedId(nextSavedLists[0].listId);

          setSelectedDetail(nextSavedLists[0]);
        } else {
          setSelectedId(null);

          setSelectedDetail(null);
        }

        alert("리스트 저장을 취소했습니다.");
      } else {
        alert(res.message || "저장 취소에 실패했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
   * 리스트 아이템 삭제
   * ========================================================= */

  const handleDeleteItem = async (item: ListItem) => {
    if (!selectedDetail || !isOwner) {
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
      /* 상세 식당 제거 */

      setSelectedDetail((prev) =>
        prev
          ? {
              ...prev,

              items: prev.items.filter((listItem) => listItem.id !== item.id),
            }
          : null,
      );

      /* 내 리스트 개수 수정 */

      setMyLists((prev) =>
        prev.map((list) =>
          list.id === selectedDetail.listId
            ? {
                ...list,

                itemCount: Math.max(0, list.itemCount - 1),
              }
            : list,
        ),
      );

      /* 공개 목록 개수 수정 */

      setPublicLists((prev) =>
        prev.map((list) =>
          list.id === selectedDetail.listId
            ? {
                ...list,

                itemCount: Math.max(0, list.itemCount - 1),
              }
            : list,
        ),
      );
    } else {
      alert(res.message || "삭제에 실패했습니다.");
    }
  };

  /* =========================================================
   * 공통 리스트 카드
   * ========================================================= */

  const renderListCard = (
    list: ListSummary,
    selected: boolean,
    onClick: () => void,
    showAuthor = false,
  ) => (
    <button
      key={list.id}
      type="button"
      onClick={onClick}
      className={`w-full min-w-0 rounded-2xl border p-5 text-left transition-all ${
        selected
          ? "border-primary bg-primary-soft/40 ring-1 ring-primary"
          : "border-hairline-soft bg-surface hover:bg-surface-soft"
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
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
          <div className="flex min-w-0 items-start justify-between gap-2">
            <p className="min-w-0 flex-1 truncate text-base font-bold text-ink">
              {list.title}
            </p>

            <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
              {list.moodTag}
            </span>
          </div>

          <p className="mt-1 line-clamp-1 text-sm text-muted">
            {list.description}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-muted-soft">
            {showAuthor && (
              <>
                <span>by {list.nickname}</span>

                <span>·</span>
              </>
            )}

            <span>식당 {list.itemCount}개</span>
          </div>
        </div>
      </div>
    </button>
  );

  /* =========================================================
   * 화면
   * ========================================================= */

  return (
    <AppShell
      leftSidebar={
        <div className="sticky top-28 space-y-5">
          <SidebarProfile />

          {/* =================================================
           * 인기 맛집 리스트
           * ================================================= */}

          <SidebarCard title="인기 맛집 리스트">
            <div className="space-y-4">
              {publicLists.slice(0, 5).map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleSelectSidebarList(list.id)}
                  className="block w-full rounded-xl bg-surface-soft p-4 text-left transition-colors hover:bg-hairline-soft/50"
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-base font-bold text-ink">
                      {list.title}
                    </p>

                    <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                      {list.moodTag}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-muted">
                    by {list.nickname} · 식당 {list.itemCount}개
                  </p>
                </button>
              ))}
            </div>
          </SidebarCard>

          {/* =================================================
           * 최근 생성된 리스트
           * ================================================= */}

          <SidebarCard title="최근 생성된 리스트">
            <div className="space-y-4">
              {recentLists.slice(0, 5).map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleSelectSidebarList(list.id)}
                  className="block w-full rounded-xl bg-surface-soft p-4 text-left transition-colors hover:bg-hairline-soft/50"
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-base font-bold text-ink">
                      {list.title}
                    </p>

                    <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                      {list.moodTag}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-muted">
                    by {list.nickname} · 식당 {list.itemCount}개
                  </p>
                </button>
              ))}
            </div>
          </SidebarCard>
        </div>
      }
    >
      <div className="min-w-0 space-y-5">
        {/* =================================================
         * 상단
         * ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">맛집 리스트</h2>

          <button
            type="button"
            onClick={() => router.push("/lists/create")}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-active"
          >
            <Plus className="h-4 w-4" />
            리스트 만들기
          </button>
        </div>

        {/* =================================================
         * 로딩 / 오류 / 본문
         * ================================================= */}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl border border-hairline-soft bg-surface" />

            <div className="h-24 animate-pulse rounded-2xl border border-hairline-soft bg-surface" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : (
          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
            {/* =================================================
             * 가운데 리스트 영역
             * ================================================= */}

            <div className="min-w-0 space-y-3">
              {/* 탭 */}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectMyTab}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    activeTab === "my"
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:text-ink"
                  }`}
                >
                  내 리스트
                </button>

                <button
                  type="button"
                  onClick={handleSelectSavedTab}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    activeTab === "saved"
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:text-ink"
                  }`}
                >
                  저장한 리스트
                </button>

                <button
                  type="button"
                  onClick={handleSelectPublicTab}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    activeTab === "public"
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:text-ink"
                  }`}
                >
                  다른 사람 리스트
                </button>
              </div>

              {/* =================================================
               * 내 리스트
               * ================================================= */}

              {activeTab === "my" &&
                (myLists.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">
                    등록된 리스트가 없습니다.
                  </p>
                ) : (
                  myLists.map((list) =>
                    renderListCard(
                      list,

                      selectedId === list.id,

                      () => handleSelectMyList(list.id),
                    ),
                  )
                ))}

              {/* =================================================
               * 저장한 리스트
               * ================================================= */}

              {activeTab === "saved" &&
                (savedLists.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">
                    저장한 리스트가 없습니다.
                  </p>
                ) : (
                  savedLists.map((list) => (
                    <button
                      key={list.listId}
                      type="button"
                      onClick={() => handleSelectSavedList(list.listId)}
                      className={`w-full min-w-0 rounded-2xl border p-5 text-left transition-all ${
                        selectedId === list.listId
                          ? "border-primary bg-primary-soft/40 ring-1 ring-primary"
                          : "border-hairline-soft bg-surface hover:bg-surface-soft"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-strong">
                          <img
                            src="/list-placeholder.png"
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <p className="min-w-0 flex-1 truncate text-base font-bold text-ink">
                              {list.title}
                            </p>

                            <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                              {list.moodTag}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-1 text-sm text-muted">
                            {list.description}
                          </p>

                          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-muted-soft">
                            <span>by {list.nickname}</span>

                            <span>·</span>

                            <span>식당 {list.items.length}개</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ))}

              {/* =================================================
               * 다른 사람 리스트
               * ================================================= */}

              {activeTab === "public" &&
                (otherUserLists.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">
                    다른 사람의 리스트가 없습니다.
                  </p>
                ) : (
                  otherUserLists.map((list) =>
                    renderListCard(
                      list,

                      selectedId === list.id,

                      () => handleSelectPublicList(list.id),

                      true,
                    ),
                  )
                ))}
            </div>

            {/* =================================================
             * 오른쪽 상세 영역
             * ================================================= */}

            <div className="min-h-[520px] min-w-0 rounded-2xl border border-hairline-soft bg-surface p-4 sm:p-6">
              {selectedDetail ? (
                <>
                  {/* 상세 상단 */}

                  <div className="flex min-w-0 flex-col gap-4 border-b border-hairline-soft pb-5 sm:flex-row sm:items-start sm:justify-between">
                    {/* 정보 */}

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="min-w-0 break-words text-xl font-bold text-ink">
                          {selectedDetail.title}
                        </h3>

                        <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                          {selectedDetail.moodTag}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-muted">
                        by {selectedDetail.nickname}
                      </p>

                      <p className="mt-1.5 break-words text-base text-muted">
                        {selectedDetail.description}
                      </p>

                      <p className="mt-2 text-sm text-muted-soft">
                        식당 {sortedSelectedItems.length}개
                      </p>
                    </div>

                    {/* 버튼 */}

                    <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-2">
                      {isOwner ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/lists/${selectedDetail.listId}/edit`)
                          }
                          className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-active"
                        >
                          리스트 수정
                        </button>
                      ) : activeTab === "saved" ? (
                        <>
                          <button
                            type="button"
                            onClick={handleUnsave}
                            disabled={saving}
                            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-70"
                          >
                            <Bookmark className="h-4 w-4 shrink-0" />

                            {saving ? "취소 중..." : "저장 취소"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCopy}
                            disabled={copying}
                            className="shrink-0 whitespace-nowrap rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-ink disabled:opacity-70"
                          >
                            {copying ? "복사 중..." : "내 리스트로 복사"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-ink disabled:opacity-70"
                          >
                            <Bookmark className="h-4 w-4 shrink-0" />

                            {saving ? "저장 중..." : "저장"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCopy}
                            disabled={copying}
                            className="shrink-0 whitespace-nowrap rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-ink disabled:opacity-70"
                          >
                            {copying ? "복사 중..." : "내 리스트로 복사"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* =================================================
                   * 식당 목록
                   * ================================================= */}

                  <div className="mt-6 space-y-4">
                    {sortedSelectedItems.length === 0 ? (
                      <p className="py-10 text-center text-sm text-muted">
                        등록된 식당이 없습니다.
                      </p>
                    ) : (
                      sortedSelectedItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex min-w-0 items-start gap-3 rounded-xl border border-hairline-soft bg-surface-soft p-4 sm:gap-4"
                        >
                          {/* 순번 */}

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {index + 1}
                          </div>

                          {/* 식당 정보 */}

                          <div className="min-w-0 flex-1">
                            <p className="break-words text-base font-bold text-ink">
                              {item.restaurantName}
                            </p>

                            <p className="mt-1 line-clamp-2 break-words text-sm text-muted">
                              {item.memo || "메모가 없습니다."}
                            </p>
                          </div>

                          {/* 내 리스트만 수정/삭제 표시 */}

                          {isOwner && (
                            <div className="relative z-10 flex shrink-0 items-center gap-1 text-muted">
                              <button
                                type="button"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white hover:text-primary"
                                aria-label="순서 변경"
                              >
                                <GripVertical className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();

                                  void handleDeleteItem(item);
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-red-50 hover:text-red-500"
                                aria-label="식당 삭제"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
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
