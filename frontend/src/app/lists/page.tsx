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
 * 확인창 작업 종류
 * ========================================================= */

type ConfirmAction =
  | {
      type: "deleteItem";
      item: ListItem;
    }
  | {
      type: "unsave";
    }
  | null;

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
   * 화면 상태
   * --------------------------------------------------------- */

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [mapError, setMapError] = useState("");

  const [saving, setSaving] = useState(false);

  const [copying, setCopying] = useState(false);

  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  /* ---------------------------------------------------------
   * 알림창
   * --------------------------------------------------------- */

  const [alertOpen, setAlertOpen] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");

  /* ---------------------------------------------------------
   * 확인창
   * --------------------------------------------------------- */

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  /* ---------------------------------------------------------
   * Ref
   * --------------------------------------------------------- */

  const initialized = useRef(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  /* =========================================================
   * 알림창 열기
   * ========================================================= */

  const showAlert = (message: string) => {
    setAlertMessage(message);

    setAlertOpen(true);
  };

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

    const sortedItems = [...selectedDetail.items].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

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

        const map = new maps.Map(mapContainerRef.current, {
          center: firstPosition,
          level: 5,
        });

        const bounds = new maps.LatLngBounds();

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

        if (itemsWithCoordinates.length > 1) {
          map.setBounds(bounds);
        }
      };

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
   * ========================================================= */

  const otherLists = publicLists.filter(
    (publicList) => !myLists.some((myList) => myList.id === publicList.id),
  );

  /* =========================================================
   * 인기 맛집 리스트
   * ========================================================= */

  const popularLists = publicLists.slice(0, 5);

  /* =========================================================
   * 최근 생성된 리스트
   * ========================================================= */

  const recentLists = [...publicLists]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

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
   * 사이드바 리스트 클릭
   * ========================================================= */

  const handleSelectSidebarList = (listId: number) => {
    const isMyList = myLists.some((list) => list.id === listId);

    setActiveTab(isMyList ? "my" : "other");

    setSelectedId(listId);

    setMapError("");
  };

  /* =========================================================
   * 식당 삭제 확인창 열기
   * ========================================================= */

  const handleDeleteItem = (item: ListItem) => {
    if (!selectedDetail) {
      return;
    }

    if (activeTab !== "my") {
      return;
    }

    if (deletingItemId !== null) {
      return;
    }

    setConfirmAction({
      type: "deleteItem",
      item,
    });
  };

  /* =========================================================
   * 실제 식당 삭제
   * ========================================================= */

  const executeDeleteItem = async (item: ListItem) => {
    if (!selectedDetail) {
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
        showAlert(res.message || "식당 삭제에 실패했습니다.");

        return;
      }

      setSelectedDetail((prev) => {
        if (!prev) {
          return null;
        }

        return {
          ...prev,
          items: prev.items.filter((listItem) => listItem.id !== item.id),
        };
      });

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

      setPublicLists((prev) =>
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

      showAlert("식당 삭제 중 오류가 발생했습니다.");
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
        showAlert(res.message || "리스트 저장에 실패했습니다.");

        return;
      }

      await loadLists();

      showAlert("리스트를 저장했습니다.");
    } catch (error) {
      console.error("리스트 저장 오류:", error);

      showAlert("리스트 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
   * 저장 취소 확인창 열기
   *
   * 저장한 리스트 탭 / 다른 사람 리스트 탭 모두 사용
   * ========================================================= */

  const handleUnsave = () => {
    if (!selectedDetail || saving) {
      return;
    }

    setConfirmAction({
      type: "unsave",
    });
  };

  /* =========================================================
   * 실제 저장 취소
   *
   * 저장한 리스트 탭:
   * 저장 취소 후 목록에서 사라지므로 상세 화면 비움
   *
   * 다른 사람 리스트 탭:
   * 공개 리스트 자체는 남아 있으므로 상세 화면 유지
   * ========================================================= */

  const executeUnsave = async () => {
    if (!selectedDetail || saving) {
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
        showAlert(res.message || "저장 취소에 실패했습니다.");

        return;
      }

      await loadLists();

      if (activeTab === "saved") {
        setSelectedId(null);

        setSelectedDetail(null);
      }

      showAlert("리스트 저장을 취소했습니다.");
    } catch (error) {
      console.error("저장 취소 오류:", error);

      showAlert("저장 취소 중 오류가 발생했습니다.");
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
        showAlert(res.message || "리스트 복사에 실패했습니다.");

        return;
      }

      await loadLists();

      setActiveTab("my");

      if (res.data) {
        setSelectedId(res.data.listId);
      } else {
        setSelectedId(null);
      }

      showAlert("내 리스트로 복사되었습니다.");
    } catch (error) {
      console.error("리스트 복사 오류:", error);

      showAlert("리스트 복사 중 오류가 발생했습니다.");
    } finally {
      setCopying(false);
    }
  };

  /* =========================================================
   * 확인 버튼 처리
   * ========================================================= */

  const handleConfirm = () => {
    const action = confirmAction;

    setConfirmAction(null);

    if (!action) {
      return;
    }

    if (action.type === "deleteItem") {
      void executeDeleteItem(action.item);

      return;
    }

    if (action.type === "unsave") {
      void executeUnsave();
    }
  };

  /* =========================================================
   * 확인창 내용
   * ========================================================= */

  const confirmMessage =
    confirmAction?.type === "deleteItem"
      ? `리스트에서 '${confirmAction.item.restaurantName}'을 삭제할까요?`
      : confirmAction?.type === "unsave"
        ? "리스트 저장을 취소할까요?"
        : "";

  const confirmButtonText =
    confirmAction?.type === "deleteItem" ? "삭제" : "확인";

  const confirmDestructive = confirmAction?.type === "deleteItem";

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
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-strong">
          <img
            src="/list-placeholder.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

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
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-strong">
          <img
            src="/list-placeholder.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

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
    <>
      <AppShell
        fullWidth
        leftSidebar={
          <div className="sticky top-28 space-y-5">
            <SidebarProfile />

            {/* 인기 맛집 리스트 */}

            <SidebarCard title="인기 맛집 리스트">
              <div className="space-y-4">
                {popularLists.length === 0 ? (
                  <p className="py-2 text-sm text-muted">
                    등록된 공개 리스트가 없습니다.
                  </p>
                ) : (
                  popularLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => handleSelectSidebarList(list.id)}
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
                  ))
                )}
              </div>
            </SidebarCard>

            {/* 최근 생성된 리스트 */}

            <SidebarCard title="최근 생성된 리스트">
              <div className="space-y-4">
                {recentLists.length === 0 ? (
                  <p className="py-2 text-sm text-muted">
                    최근 생성된 리스트가 없습니다.
                  </p>
                ) : (
                  recentLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => handleSelectSidebarList(list.id)}
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
                  ))
                )}
              </div>
            </SidebarCard>
          </div>
        }
      >
        <div className="w-full min-w-0 space-y-5">
          {/* 페이지 상단 */}

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

          {/* 로딩 / 에러 */}

          {loading ? (
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-2xl border border-hairline-soft bg-surface" />

              <div className="h-24 animate-pulse rounded-2xl border border-hairline-soft bg-surface" />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-500">{error}</p>
          ) : (
            <div className="grid w-full min-w-0 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
              {/* 리스트 목록 */}

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

              {/* 오른쪽 상세 */}

              <div className="min-h-[680px] min-w-0 overflow-hidden rounded-2xl border border-hairline-soft bg-surface">
                {selectedDetail ? (
                  <>
                    {/* 상세 상단 */}

                    <div className="flex flex-col gap-4 border-b border-hairline-soft p-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
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
                      </div>

                      {/* 식당 개수 + 버튼 */}

                      <div className="flex shrink-0 flex-wrap items-center gap-3">
                        <span className="text-sm text-muted">
                          식당 {selectedItems.length}개
                        </span>

                        {/* 내 리스트 */}

                        {activeTab === "my" && (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/lists/${selectedDetail.listId}/edit`,
                              )
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
                              <Bookmark className="h-4 w-4 fill-current" />

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
                                onClick={handleUnsave}
                                disabled={saving}
                                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-70"
                              >
                                <Bookmark className="h-4 w-4 fill-current" />

                                {saving ? "취소 중..." : "저장 취소"}
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

                    {/* 식당 없음 */}

                    {selectedItems.length === 0 ? (
                      <p className="py-24 text-center text-sm text-muted">
                        등록된 식당이 없습니다.
                      </p>
                    ) : (
                      /* 식당 목록 + 지도 */

                      <div className="grid min-w-0 lg:grid-cols-[minmax(360px,2fr)_minmax(0,3fr)]">
                        {/* 리스트 코스 */}

                        <div className="min-w-0 border-b border-hairline-soft p-6 lg:border-r lg:border-b-0">
                          <h4 className="mb-5 text-base font-bold text-ink">
                            리스트 코스
                          </h4>

                          <div className="space-y-4">
                            {selectedItems.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex min-w-0 gap-4 rounded-2xl bg-surface-soft p-4"
                              >
                                {/* 번호 */}

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                  {index + 1}
                                </div>

                                {/* 식당 정보 */}

                                <div className="min-w-0 flex-1">
                                  {/* 식당명 + 카테고리 + 삭제 */}

                                  <div className="flex min-w-0 items-center gap-2">
                                    <p className="min-w-0 truncate text-lg font-bold text-ink">
                                      {item.restaurantName}
                                    </p>

                                    {item.category && (
                                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted">
                                        {item.category}
                                      </span>
                                    )}

                                    {activeTab === "my" && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteItem(item)}
                                        disabled={deletingItemId === item.id}
                                        aria-label={`${item.restaurantName} 삭제`}
                                        className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>

                                  {/* 주소 */}

                                  {(item.roadAddress || item.address) && (
                                    <div className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-muted">
                                      <MapPin className="h-4 w-4 shrink-0" />

                                      <span
                                        className="min-w-0 truncate"
                                        title={
                                          item.roadAddress || item.address || ""
                                        }
                                      >
                                        {item.roadAddress || item.address}
                                      </span>
                                    </div>
                                  )}

                                  {/* 한줄평 */}

                                  {item.memo && (
                                    <p className="mt-2 break-words text-sm leading-6 text-body">
                                      {item.memo}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 지도 */}

                        <div className="min-w-0 p-6">
                          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-base font-bold text-ink">
                              지도
                            </h4>

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

      {/* =====================================================
       * 일반 알림창
       * ===================================================== */}

      {alertOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="px-8 py-8">
              <p className="text-lg leading-7 text-ink">{alertMessage}</p>
            </div>

            <div className="flex justify-end border-t border-hairline px-6 py-4">
              <button
                type="button"
                onClick={() => setAlertOpen(false)}
                className="rounded-lg px-4 py-2 text-base font-bold text-primary transition-colors hover:bg-primary/5"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
       * 삭제 / 저장 취소 확인창
       * ===================================================== */}

      {confirmAction !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="px-8 py-8">
              <p className="text-lg leading-7 text-ink">{confirmMessage}</p>
            </div>

            <div className="flex justify-end gap-2 border-t border-hairline px-6 py-4">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={deletingItemId !== null || saving}
                className="rounded-lg px-4 py-2 text-base font-bold text-muted transition-colors hover:bg-surface-soft disabled:opacity-50"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={deletingItemId !== null || saving}
                className={`rounded-lg px-4 py-2 text-base font-bold transition-colors disabled:opacity-50 ${
                  confirmDestructive
                    ? "text-red-500 hover:bg-red-50"
                    : "text-primary hover:bg-primary/5"
                }`}
              >
                {confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
