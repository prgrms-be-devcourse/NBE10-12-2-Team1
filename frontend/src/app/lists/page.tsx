"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

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

  address?: string | null;
  roadAddress?: string | null;

  lat?: number | null;
  lng?: number | null;

  orderIndex: number;
  memo: string;
  createdAt: string;
}

/* =========================================================
 * 일반 리스트 상세
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
 * 탭
 * ========================================================= */

type ListTab = "my" | "saved" | "other";

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
   * 현재 탭
   * --------------------------------------------------------- */

  const [activeTab, setActiveTab] = useState<ListTab>("my");

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

  const [mapError, setMapError] = useState("");

  const [saving, setSaving] = useState(false);

  const [copying, setCopying] = useState(false);

  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  /* ---------------------------------------------------------
   * Ref
   * --------------------------------------------------------- */

  const initialized = useRef(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  /* =========================================================
   * 리스트 목록 불러오기
   * ========================================================= */

  const loadLists = async (): Promise<ListSummary[]> => {
    try {
      setError("");

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
        setMyLists([]);

        setError(myRes.message || "내 리스트를 불러오지 못했습니다.");
      }

      /* 공개 리스트 */

      if (publicRes.ok && publicRes.data) {
        setPublicLists(publicRes.data);
      } else {
        setPublicLists([]);
      }

      /* 저장한 리스트 */

      if (savedRes.ok && savedRes.data) {
        setSavedLists(savedRes.data.content ?? []);
      } else {
        setSavedLists([]);
      }

      return my;
    } catch (error) {
      console.error("리스트 목록 조회 실패:", error);

      setError("리스트를 불러오는 중 오류가 발생했습니다.");

      return [];
    }
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
      const my = await loadLists();

      if (my.length > 0) {
        setSelectedId(my[0].id);
      }

      setLoading(false);
    };

    void load();
  }, []);

  /* =========================================================
   * 선택한 리스트 상세 조회
   * ========================================================= */

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setSelectedDetail(null);

      setMapError("");

      try {
        /* 저장한 리스트 */

        if (activeTab === "saved") {
          const saved = savedLists.find((list) => list.listId === selectedId);

          if (!cancelled) {
            setSelectedDetail(saved ?? null);
          }

          return;
        }

        /* 내 리스트 / 다른 사람 리스트 */

        const endpoint =
          activeTab === "my"
            ? `/api/v1/lists/${selectedId}`
            : `/api/v1/lists/all/${selectedId}`;

        const res = await apiFetchJson<ListDetail>(endpoint);

        if (cancelled) {
          return;
        }

        if (res.ok && res.data) {
          setSelectedDetail(res.data);
        } else {
          setSelectedDetail(null);

          console.error("리스트 상세 조회 실패:", res.message);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("리스트 상세 조회 오류:", error);

        setSelectedDetail(null);
      }
    };

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedId, activeTab, savedLists]);

  /* =========================================================
   * 선택한 식당 목록
   *
   * orderIndex 순으로 정렬
   * ========================================================= */

  const selectedItems = selectedDetail
    ? [...selectedDetail.items].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];

  /* =========================================================
   * 카카오맵 표시
   * ========================================================= */

  useEffect(() => {
    if (!selectedDetail) {
      return;
    }

    if (!mapContainerRef.current) {
      return;
    }

    /* -------------------------------------------------------
     * orderIndex 기준 정렬
     * ------------------------------------------------------- */

    const sortedItems = [...selectedDetail.items].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

    /* -------------------------------------------------------
     * 정상 좌표가 있는 식당만 사용
     * ------------------------------------------------------- */

    const itemsWithCoordinates = sortedItems.filter((item) => {
      if (
        item.lat === null ||
        item.lat === undefined ||
        item.lng === null ||
        item.lng === undefined
      ) {
        return false;
      }

      const lat = Number(item.lat);

      const lng = Number(item.lng);

      return Number.isFinite(lat) && Number.isFinite(lng);
    });

    /* -------------------------------------------------------
     * 좌표 없음
     * ------------------------------------------------------- */

    if (itemsWithCoordinates.length === 0) {
      setMapError("지도에 표시할 식당 위치 정보가 없습니다.");

      return;
    }

    setMapError("");

    let retryTimer: number | undefined;

    let cancelled = false;

    const initializeMap = () => {
      if (cancelled) {
        return;
      }

      const maps = window.kakao?.maps;

      /* 카카오 SDK 로딩 대기 */

      if (!maps) {
        retryTimer = window.setTimeout(initializeMap, 100);

        return;
      }

      const renderMap = () => {
        if (cancelled || !mapContainerRef.current) {
          return;
        }

        const firstItem = itemsWithCoordinates[0];

        const firstPosition = new maps.LatLng(
          Number(firstItem.lat),
          Number(firstItem.lng),
        );

        /* 지도 생성 */

        const map = new maps.Map(mapContainerRef.current, {
          center: firstPosition,
          level: 5,
        });

        /* 전체 식당 범위 */

        const bounds = new maps.LatLngBounds();

        /* 식당별 번호 마커 */

        itemsWithCoordinates.forEach((item) => {
          const itemIndex = sortedItems.findIndex(
            (sortedItem) => sortedItem.id === item.id,
          );

          const displayNumber = itemIndex + 1;

          const position = new maps.LatLng(Number(item.lat), Number(item.lng));

          bounds.extend(position);

          const content = `
            <div
              style="
                display: flex;
                width: 40px;
                height: 40px;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                border-radius: 9999px;
                background: #ff6b00;
                color: white;
                font-size: 15px;
                font-weight: 700;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.22);
              "
            >
              ${displayNumber}
            </div>
          `;

          new maps.CustomOverlay({
            map,
            position,
            content,
            yAnchor: 1.2,
          });
        });

        /* 여러 식당이면 모두 보이도록 조정 */

        if (itemsWithCoordinates.length > 1) {
          map.setBounds(bounds);
        }
      };

      /* autoload=false 대응 */

      if (typeof maps.load === "function") {
        maps.load(renderMap);
      } else {
        renderMap();
      }
    };

    initializeMap();

    return () => {
      cancelled = true;

      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [selectedDetail]);

  /* =========================================================
   * 다른 사람 리스트
   *
   * 공개 리스트 중 본인 리스트 제외
   * ========================================================= */

  const otherLists = publicLists.filter(
    (publicList) => !myLists.some((myList) => myList.id === publicList.id),
  );

  /* =========================================================
   * 최근 생성된 다른 사람 리스트
   * ========================================================= */

  const recentLists = [...otherLists].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  /* =========================================================
   * 현재 선택한 리스트가 이미 저장됐는지 확인
   * ========================================================= */

  const isSelectedListSaved =
    selectedDetail !== null &&
    savedLists.some((savedList) => savedList.listId === selectedDetail.listId);

  /* =========================================================
   * 탭 변경
   * ========================================================= */

  const handleTabChange = (tab: ListTab) => {
    setActiveTab(tab);

    setSelectedId(null);

    setSelectedDetail(null);

    setMapError("");
  };

  /* =========================================================
   * 인기 / 최근 리스트 클릭
   * ========================================================= */

  const handleSelectPublicList = (listId: number) => {
    setActiveTab("other");

    setSelectedDetail(null);

    setSelectedId(listId);

    setMapError("");
  };

  /* =========================================================
   * 내 리스트 식당 아이템 삭제
   * ========================================================= */

  const handleDeleteItem = async (item: ListItem) => {
    if (!selectedDetail) {
      return;
    }

    /* 내 리스트가 아니면 삭제 금지 */

    if (activeTab !== "my") {
      return;
    }

    if (deletingItemId !== null) {
      return;
    }

    const confirmed = confirm(
      `${item.restaurantName}을(를) 리스트에서 삭제할까요?`,
    );

    if (!confirmed) {
      return;
    }

    const currentListId = selectedDetail.listId;

    setDeletingItemId(item.id);

    try {
      const res = await apiFetchJson(
        `/api/v1/lists/${currentListId}/items/${item.id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        alert(res.message || "식당 삭제에 실패했습니다.");

        return;
      }

      /* -----------------------------------------------------
       * 오른쪽 상세에서 삭제
       *
       * selectedDetail이 바뀌면 지도 useEffect도 다시 실행됨
       * ----------------------------------------------------- */

      setSelectedDetail((prev) => {
        if (!prev) {
          return null;
        }

        return {
          ...prev,
          items: prev.items.filter((listItem) => listItem.id !== item.id),
        };
      });

      /* -----------------------------------------------------
       * 가운데 리스트 카드 식당 개수 감소
       * ----------------------------------------------------- */

      setMyLists((prev) =>
        prev.map((list) =>
          list.id === currentListId
            ? {
                ...list,
                itemCount: Math.max(0, list.itemCount - 1),
              }
            : list,
        ),
      );
    } catch (error) {
      console.error("식당 아이템 삭제 오류:", error);

      alert("식당 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingItemId(null);
    }
  };

  /* =========================================================
   * 다른 사람 리스트 저장
   * ========================================================= */

  const handleSave = async () => {
    if (!selectedDetail) {
      return;
    }

    if (isSelectedListSaved || saving) {
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

      if (!res.ok) {
        alert(res.message || "리스트 저장에 실패했습니다.");

        return;
      }

      await loadLists();

      alert("리스트를 저장했습니다.");
    } catch (error) {
      console.error("리스트 저장 오류:", error);

      alert("리스트 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
   * 저장 취소
   * ========================================================= */

  const handleUnsave = async () => {
    if (!selectedDetail || saving) {
      return;
    }

    if (!confirm("저장을 취소할까요?")) {
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

      if (!res.ok) {
        alert(res.message || "저장 취소에 실패했습니다.");

        return;
      }

      await loadLists();

      setSelectedId(null);

      setSelectedDetail(null);

      alert("리스트 저장을 취소했습니다.");
    } catch (error) {
      console.error("저장 취소 오류:", error);

      alert("저장 취소 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
   * 내 리스트로 복사
   * ========================================================= */

  const handleCopy = async () => {
    if (!selectedDetail || copying) {
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

      if (!res.ok) {
        alert(res.message || "리스트 복사에 실패했습니다.");

        return;
      }

      await loadLists();

      setActiveTab("my");

      if (res.data) {
        setSelectedId(res.data.listId);
      } else {
        setSelectedId(null);
      }

      alert("내 리스트로 복사되었습니다.");
    } catch (error) {
      console.error("리스트 복사 오류:", error);

      alert("리스트 복사 중 오류가 발생했습니다.");
    } finally {
      setCopying(false);
    }
  };

  /* =========================================================
   * 일반 리스트 카드
   * ========================================================= */

  const renderSummaryCard = (list: ListSummary) => (
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

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-muted-soft">
            {activeTab === "other" && (
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
   * 저장한 리스트 카드
   * ========================================================= */

  const renderSavedCard = (list: SavedListDetail) => (
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

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-muted-soft">
            <span>by {list.nickname}</span>

            <span>·</span>

            <span>식당 {list.items.length}개</span>
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
      fullWidth
      leftSidebar={
        <div className="sticky top-28 space-y-5">
          <SidebarProfile />

          {/* =================================================
           * 인기 맛집 리스트
           * ================================================= */}

          <SidebarCard title="인기 맛집 리스트">
            <div className="space-y-4">
              {otherLists.slice(0, 5).map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleSelectPublicList(list.id)}
                  className="block w-full rounded-xl bg-surface-soft p-4 text-left transition-colors hover:bg-hairline-soft/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-base font-bold text-ink">
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
                  onClick={() => handleSelectPublicList(list.id)}
                  className="block w-full rounded-xl bg-surface-soft p-4 text-left transition-colors hover:bg-hairline-soft/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-base font-bold text-ink">
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
      <div className="w-full min-w-0 space-y-5">
        {/* =================================================
         * 페이지 상단
         * ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">맛집 리스트</h2>

          <button
            type="button"
            onClick={() => router.push("/lists/create")}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-active"
          >
            <Plus className="h-4 w-4" />
            리스트 만들기
          </button>
        </div>

        {/* =================================================
         * 로딩 / 에러
         * ================================================= */}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl border border-hairline-soft bg-surface" />

            <div className="h-24 animate-pulse rounded-2xl border border-hairline-soft bg-surface" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : (
          <div className="grid w-full min-w-0 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
            {/* =================================================
             * 리스트 목록
             * ================================================= */}

            <div className="min-w-0 space-y-3">
              {/* 탭 */}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTabChange("my")}
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
                  onClick={() => handleTabChange("saved")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    activeTab === "saved"
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:text-ink"
                  }`}
                >
                  저장한 리스트
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("other")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                    activeTab === "other"
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:text-ink"
                  }`}
                >
                  다른 사람 리스트
                </button>
              </div>

              {/* 내 리스트 */}

              {activeTab === "my" &&
                (myLists.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">
                    등록된 리스트가 없습니다.
                  </p>
                ) : (
                  myLists.map(renderSummaryCard)
                ))}

              {/* 저장한 리스트 */}

              {activeTab === "saved" &&
                (savedLists.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">
                    저장한 리스트가 없습니다.
                  </p>
                ) : (
                  savedLists.map(renderSavedCard)
                ))}

              {/* 다른 사람 리스트 */}

              {activeTab === "other" &&
                (otherLists.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">
                    다른 사람의 리스트가 없습니다.
                  </p>
                ) : (
                  otherLists.map(renderSummaryCard)
                ))}
            </div>

            {/* =================================================
             * 오른쪽 상세
             * ================================================= */}

            <div className="min-h-[680px] min-w-0 overflow-hidden rounded-2xl border border-hairline-soft bg-surface">
              {selectedDetail ? (
                <>
                  {/* =============================================
                   * 상세 상단
                   * ============================================= */}

                  <div className="flex flex-col gap-4 border-b border-hairline-soft p-6 sm:flex-row sm:items-start sm:justify-between">
                    {/* 리스트 정보 */}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-2xl font-bold text-ink">
                          {selectedDetail.title}
                        </h3>

                        <span className="shrink-0 rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                          {selectedDetail.moodTag}
                        </span>
                      </div>

                      <p className="mt-2 break-words text-base text-muted">
                        {selectedDetail.description}
                      </p>

                      {activeTab !== "my" && (
                        <p className="mt-2 text-sm text-muted-soft">
                          by {selectedDetail.nickname}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-muted-soft">
                        식당 {selectedItems.length}개
                      </p>
                    </div>

                    {/* 버튼 */}

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {/* 내 리스트 */}

                      {activeTab === "my" && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/lists/${selectedDetail.listId}/edit`)
                          }
                          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-active"
                        >
                          <Pencil className="h-4 w-4" />
                          수정
                        </button>
                      )}

                      {/* 저장한 리스트 */}

                      {activeTab === "saved" && (
                        <>
                          <button
                            type="button"
                            onClick={handleUnsave}
                            disabled={saving}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-70"
                          >
                            <Bookmark className="h-4 w-4" />

                            {saving ? "취소 중..." : "저장 취소"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCopy}
                            disabled={copying}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-ink disabled:opacity-70"
                          >
                            {copying ? "복사 중..." : "내 리스트로 복사"}
                          </button>
                        </>
                      )}

                      {/* 다른 사람 리스트 */}

                      {activeTab === "other" && (
                        <>
                          {isSelectedListSaved ? (
                            <button
                              type="button"
                              disabled
                              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
                            >
                              <Bookmark className="h-4 w-4 fill-current" />
                              저장됨
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSave}
                              disabled={saving}
                              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-ink disabled:opacity-70"
                            >
                              <Bookmark className="h-4 w-4" />

                              {saving ? "저장 중..." : "저장"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={handleCopy}
                            disabled={copying}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-soft px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-ink disabled:opacity-70"
                          >
                            {copying ? "복사 중..." : "내 리스트로 복사"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* =============================================
                   * 식당 없음
                   * ============================================= */}

                  {selectedItems.length === 0 ? (
                    <p className="py-24 text-center text-sm text-muted">
                      등록된 식당이 없습니다.
                    </p>
                  ) : (
                    /* ===========================================
                     * 식당 목록 + 지도
                     * =========================================== */

                    <div className="grid min-w-0 lg:grid-cols-[minmax(360px,2fr)_minmax(0,3fr)]">
                      {/* =========================================
                       * 리스트 코스
                       * ========================================= */}

                      <div className="min-w-0 border-b border-hairline-soft p-6 lg:border-r lg:border-b-0">
                        <h4 className="mb-5 text-base font-bold text-ink">
                          리스트 코스
                        </h4>

                        <div className="space-y-4">
                          {selectedItems.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex min-w-0 gap-4 rounded-2xl bg-surface-soft p-5"
                            >
                              {/* 번호 */}

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                {index + 1}
                              </div>

                              {/* 식당 정보 */}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="break-words text-lg font-bold text-ink">
                                      {item.restaurantName}
                                    </p>

                                    {item.category && (
                                      <p className="mt-1 text-sm text-muted-soft">
                                        {item.category}
                                      </p>
                                    )}
                                  </div>

                                  {/* =================================
                                   * 내 리스트에서만 삭제 버튼 표시
                                   * ================================= */}

                                  {activeTab === "my" && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item)}
                                      disabled={deletingItemId === item.id}
                                      aria-label={`${item.restaurantName} 삭제`}
                                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>

                                {/* 주소 */}

                                {(item.roadAddress || item.address) && (
                                  <div className="mt-3 flex items-start gap-1.5 text-sm text-muted">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                                    <span className="break-words">
                                      {item.roadAddress || item.address}
                                    </span>
                                  </div>
                                )}

                                {/* 한줄평 */}

                                {item.memo && (
                                  <p className="mt-3 break-words text-base text-muted">
                                    {item.memo}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* =========================================
                       * 지도
                       * ========================================= */}

                      <div className="min-w-0 p-6">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-base font-bold text-ink">지도</h4>

                          <span className="text-sm text-muted">
                            번호는 리스트 순서입니다
                          </span>
                        </div>

                        <div className="relative min-h-[600px] overflow-hidden rounded-2xl border border-hairline-soft">
                          <div
                            ref={mapContainerRef}
                            className="h-[600px] w-full"
                          />

                          {mapError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-surface-soft">
                              <p className="px-6 text-center text-sm text-muted">
                                {mapError}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="py-24 text-center text-base text-muted">
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
