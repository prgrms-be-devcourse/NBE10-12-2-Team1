"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Search, X } from "lucide-react";

import AppShell from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";

/* =========================================================
 * 카카오 검색 결과
 * ========================================================= */

interface KakaoRestaurant {
  kakaoPlaceId: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  region1: string;
  region2: string;
  region3: string;
  phone: string;
  lat: number;
  lng: number;
}

/* =========================================================
 * Restaurant 조회 / 저장 응답
 * ========================================================= */

interface RestaurantResponse {
  id: number;
  kakaoPlaceId: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  region1: string;
  region2: string;
  region3: string;
  phone: string;
  lat: number;
  lng: number;
}

/* =========================================================
 * 사용자가 선택한 식당
 * ========================================================= */

interface SelectedRestaurant {
  restaurantId: number;
  kakaoPlaceId: string;
  name: string;
  category: string;
  address: string;
  comment: string;
}

/* =========================================================
 * 리스트 생성 응답
 *
 * 백엔드 응답 필드가 id인지 listId인지 아직 확실하지 않아서
 * 둘 다 받을 수 있도록 작성
 * ========================================================= */

interface CreateListResponse {
  id?: number;
  listId?: number;
}

/* =========================================================
 * 무드태그
 *
 * ⚠️ 반드시 백엔드 MoodTag enum 값과 맞아야 함
 * 아래 값은 현재 예시
 * ========================================================= */

const moodTags = [
  {
    label: "데이트",
    value: "DATE",
  },
  {
    label: "친구와",
    value: "FRIENDS",
  },
  {
    label: "가족과",
    value: "FAMILY",
  },
  {
    label: "혼밥",
    value: "SOLO",
  },
];

/* =========================================================
 * 페이지
 * ========================================================= */

export default function CreateListPage() {
  const router = useRouter();

  /* ---------------------------------------------------------
   * 현재 단계
   *
   * 1 = 기본 정보
   * 2 = 식당 선택
   * 3 = 최종 확인
   * --------------------------------------------------------- */

  const [step, setStep] = useState(1);

  /* ---------------------------------------------------------
   * 1단계 - 리스트 기본 정보
   * --------------------------------------------------------- */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moodTag, setMoodTag] = useState("");

  /* ---------------------------------------------------------
   * 2단계 - 카카오 식당 검색
   * --------------------------------------------------------- */

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KakaoRestaurant[]>([]);

  /* ---------------------------------------------------------
   * 선택한 식당
   * --------------------------------------------------------- */

  const [selectedRestaurants, setSelectedRestaurants] = useState<
    SelectedRestaurant[]
  >([]);

  /* ---------------------------------------------------------
   * 상태
   * --------------------------------------------------------- */

  const [searching, setSearching] = useState(false);
  const [selectingPlaceId, setSelectingPlaceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------
   * 카카오 Places 객체
   * --------------------------------------------------------- */

  const placesRef = useRef<any>(null);

  /* =========================================================
   * 카카오맵 SDK 준비
   * ========================================================= */

  useEffect(() => {
    let retryTimer: number | undefined;
    let cancelled = false;

    const initializeKakao = () => {
      if (cancelled) {
        return;
      }

      // 1. 카카오 SDK 자체가 아직 없을 때만 재시도
      const maps = window.kakao?.maps;
      if (!maps) {
        retryTimer = window.setTimeout(initializeKakao, 100);

        return;
      }

      // 2. 카카오맵 SDK 로딩 완료 후 Places 객체 생성
      const createPlaces = () => {
        if (cancelled) {
          return;
        }

        // services 라이브러리가 실제로 포함되어 있는지 확인
        if (!maps.services) {
          setError("카카오맵 services 라이브러리를 불러오지 못했습니다.");

          return;
        }

        placesRef.current = new maps.services.Places();

        setError("");
      };

      // autoload=false인 경우 여기서 실제 SDK 로딩
      if (typeof maps.load === "function") {
        maps.load(createPlaces);
      } else {
        createPlaces();
      }
    };

    initializeKakao();

    return () => {
      cancelled = true;

      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  /* =========================================================
   * 1단계 → 2단계
   *
   * 중요:
   * 여기서는 백엔드 API 호출 안 함
   * ========================================================= */

  const handleNextFromBasicInfo = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!moodTag) {
      alert("무드 태그를 선택해주세요.");
      return;
    }

    setStep(2);
  };

  /* =========================================================
   * 카카오 식당 검색
   * ========================================================= */

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    const services = window.kakao?.maps?.services;

    if (!placesRef.current || !services) {
      setError("카카오맵 검색 서비스를 불러오는 중입니다.");
      return;
    }

    setSearching(true);
    setError("");

    placesRef.current.keywordSearch(
      query.trim(),

      (data: any[], status: any) => {
        if (status === services.Status.OK) {
          const mapped: KakaoRestaurant[] = data.map((item: any) => {
            const addressParts = item.address_name
              ? item.address_name.split(" ")
              : [];

            return {
              kakaoPlaceId: item.id,
              name: item.place_name,
              category: item.category_name,
              address: item.address_name,
              roadAddress: item.road_address_name,
              region1: addressParts[0] || "",
              region2: addressParts[1] || "",
              region3: addressParts[2] || "",
              phone: item.phone || "",
              lat: Number(item.y),
              lng: Number(item.x),
            };
          });

          setSearchResults(mapped);
        } else if (status === services.Status.ZERO_RESULT) {
          setSearchResults([]);
          setError("검색 결과가 없습니다.");
        } else {
          setSearchResults([]);
          setError("검색 결과를 불러오지 못했습니다.");
        }

        setSearching(false);
      },

      {
        category_group_code: "FD6",
        size: 15,
      },
    );
  };

  /* =========================================================
   * Restaurant 테이블에 식당이 있는지 확인
   *
   * 1. 있으면 기존 Restaurant 반환
   * 2. 없으면 POST로 저장
   * 3. DB의 restaurant.id 반환
   * ========================================================= */

  const ensureRestaurant = async (
    restaurant: KakaoRestaurant,
  ): Promise<RestaurantResponse | null> => {
    /* -------------------------------------------------------
     * 1. kakaoPlaceId로 기존 식당 조회
     * ------------------------------------------------------- */

    const findRes = await apiFetchJson<RestaurantResponse>(
      `/api/v1/restaurants?kakaoPlaceId=${restaurant.kakaoPlaceId}`,
    );

    if (findRes.ok && findRes.data) {
      return findRes.data;
    }

    /* -------------------------------------------------------
     * 2. DB에 없으면 Restaurant 저장
     * ------------------------------------------------------- */

    const saveRes = await apiFetchJson<RestaurantResponse>(
      "/api/v1/restaurants",
      {
        method: "POST",
        body: JSON.stringify({
          kakaoPlaceId: restaurant.kakaoPlaceId,

          name: restaurant.name,

          /*
           * 백엔드 DTO:
           *
           * String categoryName
           */
          categoryName: restaurant.category,

          address: restaurant.address,
          roadAddress: restaurant.roadAddress,
          region1: restaurant.region1,
          region2: restaurant.region2,
          region3: restaurant.region3,
          phone: restaurant.phone,
          lat: restaurant.lat,
          lng: restaurant.lng,
        }),
      },
    );

    if (!saveRes.ok || !saveRes.data) {
      alert(saveRes.message || "식당 저장에 실패했습니다.");

      return null;
    }

    return saveRes.data;
  };

  /* =========================================================
   * 식당 선택
   *
   * 일반 SearchPage와 다른 점:
   *
   * router.push() X
   * selectedRestaurants에 추가 O
   * ========================================================= */

  const handleSelectRestaurant = async (restaurant: KakaoRestaurant) => {
    /* 이미 선택된 식당인지 확인 */

    const alreadySelected = selectedRestaurants.some(
      (item) => item.kakaoPlaceId === restaurant.kakaoPlaceId,
    );

    if (alreadySelected) {
      return;
    }

    if (selectingPlaceId) {
      return;
    }

    setSelectingPlaceId(restaurant.kakaoPlaceId);

    try {
      /* Restaurant 테이블 데이터 확보 */

      const savedRestaurant = await ensureRestaurant(restaurant);

      if (!savedRestaurant) {
        return;
      }

      /* 선택 목록에 추가 */

      setSelectedRestaurants((prev) => [
        ...prev,
        {
          restaurantId: savedRestaurant.id,
          kakaoPlaceId: restaurant.kakaoPlaceId,
          name: restaurant.name,
          category: restaurant.category,
          address: restaurant.roadAddress || restaurant.address,
          comment: "",
        },
      ]);
    } finally {
      setSelectingPlaceId(null);
    }
  };

  /* =========================================================
   * 선택한 식당 삭제
   * ========================================================= */

  const handleRemoveRestaurant = (restaurantId: number) => {
    setSelectedRestaurants((prev) =>
      prev.filter((restaurant) => restaurant.restaurantId !== restaurantId),
    );
  };

  /* =========================================================
   * 한줄평 수정
   * ========================================================= */

  const handleCommentChange = (restaurantId: number, comment: string) => {
    setSelectedRestaurants((prev) =>
      prev.map((restaurant) =>
        restaurant.restaurantId === restaurantId
          ? {
              ...restaurant,
              comment,
            }
          : restaurant,
      ),
    );
  };

  /* =========================================================
   * 2단계 → 3단계
   *
   * 여기서도 리스트 저장 안 함
   * ========================================================= */

  const handleNextFromRestaurants = () => {
    if (selectedRestaurants.length === 0) {
      alert("식당을 한 개 이상 선택해주세요.");
      return;
    }

    setStep(3);
  };

  /* =========================================================
   * 최종 저장
   *
   * 1. RestaurantList 생성
   * 2. 생성된 listId 받기
   * 3. RestaurantListItem 각각 추가
   * 4. 리스트 상세 페이지 이동
   * ========================================================= */

  const handleSaveList = async () => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      /* -----------------------------------------------------
       * 1. RestaurantList 생성
       *
       * 백엔드 DTO:
       *
       * public record RestaurantList(
       *     String title,
       *     String description,
       *     MoodTag moodTag
       * ) {}
       * ----------------------------------------------------- */

      const listResponse = await apiFetchJson<CreateListResponse>(
        "/api/v1/lists",
        {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            moodTag,
          }),
        },
      );

      if (!listResponse.ok || !listResponse.data) {
        alert(listResponse.message || "리스트 생성에 실패했습니다.");
        return;
      }

      /* -----------------------------------------------------
       * 2. 생성된 리스트 ID
       * ----------------------------------------------------- */

      const listId = listResponse.data.id ?? listResponse.data.listId;

      if (!listId) {
        console.error("리스트 생성 응답:", listResponse);

        alert("생성된 리스트 ID를 확인할 수 없습니다.");
        return;
      }

      /* -----------------------------------------------------
       * 3. 선택한 식당을 리스트 아이템으로 추가
       *
       * 현재 예상 DTO:
       *
       * {
       *   restaurantId,
       *   comment,
       *   priority
       * }
       * ----------------------------------------------------- */

      for (let index = 0; index < selectedRestaurants.length; index++) {
        const restaurant = selectedRestaurants[index];

        const itemResponse = await apiFetchJson(
          `/api/v1/lists/${listId}/items`,
          {
            method: "POST",
            body: JSON.stringify({
              restaurantId: restaurant.restaurantId,

              comment: restaurant.comment.trim(),

              priority: index + 1,
            }),
          },
        );

        if (!itemResponse.ok) {
          alert(
            itemResponse.message || `${restaurant.name} 추가에 실패했습니다.`,
          );

          return;
        }
      }

      /* -----------------------------------------------------
       * 4. 최종 완료
       * ----------------------------------------------------- */

      router.push(`/lists?selected=${listId}`);
    } catch (error) {
      console.error("리스트 저장 중 오류:", error);

      alert("리스트 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
   * 화면
   * ========================================================= */

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-hairline-soft bg-surface shadow-sm">
          {/* =================================================
           * 상단 제목
           * ================================================= */}

          <div className="flex items-center gap-3 border-b border-hairline-soft px-6 py-5">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg p-2 transition-colors hover:bg-surface-soft"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h1 className="text-xl font-bold text-ink">새 리스트 만들기</h1>
          </div>

          {/* =================================================
           * 단계 표시
           * ================================================= */}

          <div className="grid grid-cols-3 border-b border-hairline-soft">
            {[
              {
                number: 1,
                label: "기본 정보",
              },
              {
                number: 2,
                label: "식당 선택",
              },
              {
                number: 3,
                label: "완료",
              },
            ].map((item) => (
              <div
                key={item.number}
                className={`border-b-2 px-4 py-4 text-center text-sm font-bold ${
                  step === item.number
                    ? "border-primary text-primary"
                    : "border-transparent text-muted"
                }`}
              >
                {item.number}. {item.label}
              </div>
            ))}
          </div>

          {/* =================================================
           * 1단계
           * ================================================= */}

          {step === 1 && (
            <div className="p-6">
              <div className="space-y-6">
                {/* 제목 */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-ink">
                    제목
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={100}
                    placeholder="리스트 제목을 입력해주세요"
                    className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:border-primary"
                  />
                </div>

                {/* 설명 */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-ink">
                    설명
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={500}
                    placeholder="리스트를 설명해주세요"
                    className="min-h-32 w-full resize-none rounded-xl border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:border-primary"
                  />
                </div>

                {/* 무드 태그 */}

                <div>
                  <label className="mb-3 block text-sm font-bold text-ink">
                    무드 태그
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {moodTags.map((tag) => (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => setMoodTag(tag.value)}
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                          moodTag === tag.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-hairline text-muted hover:border-primary/40"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 다음 */}

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextFromBasicInfo}
                  className="rounded-xl bg-primary px-8 py-3 font-bold text-white transition-colors hover:bg-primary-active"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* =================================================
           * 2단계
           * ================================================= */}

          {step === 2 && (
            <div className="p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* =============================================
                 * 왼쪽 - 식당 검색
                 * ============================================= */}

                <div>
                  <h2 className="mb-3 font-bold text-ink">식당 검색</h2>

                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-hairline px-3">
                      <Search className="h-4 w-4 shrink-0 text-muted" />

                      <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="식당명, 지역, 음식 종류 검색"
                        className="w-full bg-transparent py-3 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={searching}
                      className="rounded-xl bg-primary px-5 font-bold text-white disabled:opacity-60"
                    >
                      {searching ? "검색 중" : "검색"}
                    </button>
                  </form>

                  {/* 오류 */}

                  {error && (
                    <p className="mt-3 text-sm text-red-500">{error}</p>
                  )}

                  {/* 검색 결과 */}

                  <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto">
                    {searchResults.length === 0 && !error ? (
                      <div className="rounded-xl border border-dashed border-hairline p-10 text-center text-sm text-muted">
                        식당을 검색해주세요.
                      </div>
                    ) : (
                      searchResults.map((restaurant) => {
                        const selected = selectedRestaurants.some(
                          (item) =>
                            item.kakaoPlaceId === restaurant.kakaoPlaceId,
                        );

                        const isSelecting =
                          selectingPlaceId === restaurant.kakaoPlaceId;

                        return (
                          <button
                            key={restaurant.kakaoPlaceId}
                            type="button"
                            disabled={selected || isSelecting}
                            onClick={() => handleSelectRestaurant(restaurant)}
                            className="flex w-full items-center justify-between rounded-xl border border-hairline-soft p-4 text-left transition-colors hover:border-primary/30 disabled:cursor-default"
                          >
                            <div className="min-w-0 pr-3">
                              <p className="font-bold text-ink">
                                {restaurant.name}
                              </p>

                              <p className="mt-1 line-clamp-1 text-xs text-muted">
                                {restaurant.category}
                              </p>

                              <p className="mt-1 text-xs text-muted">
                                {restaurant.roadAddress || restaurant.address}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${
                                selected
                                  ? "bg-primary text-white"
                                  : "border border-hairline"
                              }`}
                            >
                              {selected ? (
                                <Check className="h-4 w-4" />
                              ) : isSelecting ? (
                                "추가 중"
                              ) : (
                                "+ 추가"
                              )}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* =============================================
                 * 오른쪽 - 선택한 식당
                 * ============================================= */}

                <div>
                  <h2 className="mb-3 font-bold text-ink">
                    선택한 식당 ({selectedRestaurants.length})
                  </h2>

                  <div className="max-h-[600px] space-y-3 overflow-y-auto">
                    {selectedRestaurants.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-hairline p-10 text-center text-sm text-muted">
                        선택한 식당이 없습니다.
                      </div>
                    ) : (
                      selectedRestaurants.map((restaurant, index) => (
                        <div
                          key={restaurant.restaurantId}
                          className="rounded-xl border border-hairline-soft p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-ink">
                                {index + 1}. {restaurant.name}
                              </p>

                              <p className="mt-1 text-xs text-muted">
                                {restaurant.address}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRestaurant(restaurant.restaurantId)
                              }
                              className="shrink-0 rounded-lg p-1 text-muted hover:bg-surface-soft hover:text-ink"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {/* 한줄평 */}

                          <textarea
                            value={restaurant.comment}
                            onChange={(event) =>
                              handleCommentChange(
                                restaurant.restaurantId,
                                event.target.value,
                              )
                            }
                            maxLength={100}
                            placeholder="한줄평을 입력해주세요"
                            className="mt-3 min-h-20 w-full resize-none rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                          />

                          <p className="mt-1 text-right text-xs text-muted">
                            {restaurant.comment.length}
                            /100
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 이전 / 다음 */}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-hairline px-8 py-3 font-bold text-ink"
                >
                  이전
                </button>

                <button
                  type="button"
                  onClick={handleNextFromRestaurants}
                  className="rounded-xl bg-primary px-8 py-3 font-bold text-white"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* =================================================
           * 3단계
           * ================================================= */}

          {step === 3 && (
            <div className="p-6">
              {/* 리스트 정보 */}

              <div className="rounded-xl bg-surface-soft p-5">
                <p className="text-sm font-medium text-primary">{moodTag}</p>

                <h2 className="mt-1 text-xl font-bold text-ink">{title}</h2>

                {description && (
                  <p className="mt-2 text-sm text-body">{description}</p>
                )}
              </div>

              {/* 선택 식당 */}

              <h3 className="mt-6 text-lg font-bold text-ink">
                선택한 식당 ({selectedRestaurants.length})
              </h3>

              <div className="mt-4 space-y-3">
                {selectedRestaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.restaurantId}
                    className="rounded-xl border border-hairline-soft p-4"
                  >
                    <div className="flex gap-4">
                      <span className="font-bold text-primary">
                        {index + 1}
                      </span>

                      <div>
                        <p className="font-bold text-ink">{restaurant.name}</p>

                        <p className="mt-1 text-xs text-muted">
                          {restaurant.address}
                        </p>

                        <p className="mt-3 text-sm text-body">
                          {restaurant.comment || "한줄평 없음"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 이전 / 저장 */}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={saving}
                  className="rounded-xl border border-hairline px-8 py-3 font-bold text-ink"
                >
                  이전
                </button>

                <button
                  type="button"
                  onClick={handleSaveList}
                  disabled={saving}
                  className="rounded-xl bg-primary px-8 py-3 font-bold text-white disabled:opacity-60"
                >
                  {saving ? "저장 중..." : "저장하기"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
