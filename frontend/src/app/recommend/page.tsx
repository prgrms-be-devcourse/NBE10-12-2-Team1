"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Utensils,
  Sparkles,
  Shuffle,
  Navigation,
  X,
  ChevronRight,
  Bookmark,
  Check,
  RotateCcw,
} from "lucide-react";
import AppShell, { SidebarProfile, SidebarCard } from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";

const categories = ["한식", "일식", "양식", "중식", "분식", "카페", "아시안", "기타"];

interface HotPlace {
  id: number;
  name: string;
  category: string;
  region2: string;
}

const categoryEmoji: Record<string, string> = {
  "한식": "🍚",
  "일식": "🍣",
  "양식": "🍝",
  "중식": "🍡",
  "분식": "🍢",
  "카페": "☕\uFE0F",
  "아시안": "🍛",
  "피자": "🍕",
  "치킨": "🍗",
};
const categoryToEnum: Record<string, string> = {
  "한식": "KOREAN",
  "일식": "JAPANESE",
  "양식": "WESTERN",
  "중식": "CHINESE",
  "분식": "SNACK",
  "카페": "CAFE",
  "아시안": "ASIAN",
  "피자": "ETC",
  "치킨": "ETC",
};

const moods = ["데이트", "혼밥", "회식", "야식", "가족", "친구"];
const sorts = [
  { key: "random", label: "랜덤", icon: Shuffle },
  { key: "distance", label: "거리순", icon: Navigation },
];

const locationData: Record<string, string[]> = {
  서울: ["전체", "강남구", "강동구", "마포구", "종로구", "용산구", "중구"],
  부산: ["전체", "해울대구", "수영구", "남구", "북구"],
  대구: ["전체", "중구", "동구", "서구", "남구"],
  경기: ["수원시", "고양시", "용인시", "성남시", "부천시"],
  강원: ["춘천시", "원주시", "강릉시"],
};

const towns: Record<string, string[]> = {
  "서울 강남구": ["전체", "신사동", "녹사동", "삼성동"],
  "서울 갱동구": ["전체", "청라동", "신촌동"],
  "서울 마포구": ["전체", "홍대동", "연남동", "상수동"],
  "서울 종로구": ["전체", "종로3가", "종로5가"],
  "서울 용산구": ["전체", "이태원동", "한남동"],
  "서울 중구": ["전체", "시탐워", "을지로동"],
};

interface RecommendRestaurant {
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
  createdAt: string;
}

function categoryLabel(enumValue: string): string {
  const found = Object.entries(categoryToEnum).find(([, v]) => v === enumValue);
  return found ? found[0] : enumValue;
}

export default function RecommendPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("한식");
  const [selectedMood, setSelectedMood] = useState("혼밥");
  const [sortBy, setSortBy] = useState("random");

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("서울");
  const [selectedDistrict, setSelectedDistrict] = useState("중구");
  const [selectedTown, setSelectedTown] = useState("을지로동");

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState("");
  const [current, setCurrent] = useState<RecommendRestaurant | null>(null);
  const [hotPlaces, setHotPlaces] = useState<HotPlace[]>([]);

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markerRef = useRef<any>(null);

  const locationLabel =
    selectedCity +
    (selectedDistrict === "전체" ? "" : ` ${selectedDistrict}`) +
    (selectedTown === "전체" ? "" : ` ${selectedTown}`);

  useEffect(() => {
    const loadHotPlaces = async () => {
      const res = await apiFetchJson<HotPlace[]>("/api/v1/restaurants");
      if (res.ok && res.data) {
        setHotPlaces(res.data.slice(0, 3));
      }
    };

    loadHotPlaces();
  }, []);

  useEffect(() => {
    if (!resultModalOpen || !current || !mapRef.current || !window.kakao?.maps) return;

    const center = new window.kakao.maps.LatLng(current.lat, current.lng);
    const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 3,
    });
    setMap(kakaoMap);

    markerRef.current?.setMap(null);
    const marker = new window.kakao.maps.Marker({ position: center, map: kakaoMap });
    markerRef.current = marker;

    return () => {
      markerRef.current?.setMap(null);
      setMap(null);
    };
  }, [resultModalOpen, current]);

  const fetchRecommend = async () => {
    setRecommendLoading(true);
    setRecommendError("");

    const params = new URLSearchParams();
    params.set("category", categoryToEnum[selectedCategory]);
    if (selectedCity && selectedCity !== "전체") params.set("region1", selectedCity);
    if (selectedDistrict && selectedDistrict !== "전체") params.set("region2", selectedDistrict);
    if (selectedTown && selectedTown !== "전체") params.set("region3", selectedTown);

    const res = await apiFetchJson<RecommendRestaurant>(
      `/api/v1/restaurants/recommend?${params.toString()}`
    );

    if (res.ok && res.data) {
      setCurrent(res.data);
    } else {
      setRecommendError(res.message || "추천을 불러오지 못했습니다.");
      setCurrent(null);
    }

    setRecommendLoading(false);
  };

  const handleRecommend = async () => {
    await fetchRecommend();
    setResultModalOpen(true);
  };

  const handleNext = async () => {
    await fetchRecommend();
  };

  const handleDecide = () => {
    if (!current) return;
    setResultModalOpen(false);
    router.push(`/restaurant/${current.id}`);
  };

  const handleSave = () => {
    alert("리스트에 저장되었습니다. (API 연동 예정)");
    setResultModalOpen(false);
  };

  return (
    <AppShell
      leftSidebar={
        <div className="sticky top-28 space-y-5">
          <SidebarProfile />
          <SidebarCard title="오늘의 핫플">
            <div className="space-y-4">
              {hotPlaces.length === 0 ? (
                <p className="text-sm text-muted">등록된 식당이 없습니다.</p>
              ) : (
                hotPlaces.map((p, i) => (
                  <div key={p.id} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-base font-bold text-ink">{p.name}</p>
                      <p className="text-sm text-muted">{categoryLabel(p.category)} · {p.region2 || "-"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SidebarCard>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-ink">맛집 추천</h2>
          <p className="mt-1 text-sm text-muted">조건을 선택하면 오늘의 밥집을 추천해드려요</p>
        </div>

        <div className="rounded-2xl bg-surface p-6 border border-hairline-soft shadow-sm space-y-6">
          {/* Location */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <MapPin className="h-4 w-4 text-primary" />
              위치
            </div>
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-hairline bg-surface-soft px-4 py-3 text-left text-sm text-ink hover:bg-white transition-colors"
            >
              <span>{locationLabel || "위치 선택"}</span>
              <ChevronRight className="h-4 w-4 text-muted" />
            </button>
          </div>

          {/* Category */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <Utensils className="h-4 w-4 text-primary" />
              종류
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === item
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:bg-hairline-soft"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <Sparkles className="h-4 w-4 text-primary" />
              분위기
            </div>
            <div className="flex flex-wrap gap-2">
              {moods.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedMood(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedMood === item
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:bg-hairline-soft"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-hairline-soft pt-5">
            <div className="flex gap-2">
              {sorts.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    sortBy === key ? "bg-primary text-white" : "bg-surface-soft text-muted hover:bg-hairline-soft"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleRecommend}
              disabled={recommendLoading}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-active transition-colors disabled:opacity-70"
            >
              {recommendLoading ? "추천 중..." : "추천 받기"}
            </button>
          </div>
        </div>
      </div>

      {/* Location modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-hairline-soft pb-3">
              <h3 className="text-base font-bold text-ink">위치 선택</h3>
              <button onClick={() => setLocationModalOpen(false)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid h-72 grid-cols-3 gap-2">
              <div className="overflow-y-auto rounded-lg border border-hairline-soft bg-surface-soft">
                {Object.keys(locationData).map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setSelectedDistrict(locationData[city][0]);
                      setSelectedTown(towns[`${city} ${locationData[city][0]}`]?.[0] || "전체");
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm ${
                      selectedCity === city ? "bg-primary text-white" : "text-ink hover:bg-white"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto rounded-lg border border-hairline-soft bg-surface-soft">
                {locationData[selectedCity]?.map((district) => (
                  <button
                    key={district}
                    onClick={() => {
                      setSelectedDistrict(district);
                      setSelectedTown(towns[`${selectedCity} ${district}`]?.[0] || "전체");
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm ${
                      selectedDistrict === district ? "bg-primary text-white" : "text-ink hover:bg-white"
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto rounded-lg border border-hairline-soft bg-surface-soft">
                {(towns[`${selectedCity} ${selectedDistrict}`] || ["전체"]).map((town) => (
                  <button
                    key={town}
                    onClick={() => setSelectedTown(town)}
                    className={`block w-full px-3 py-2 text-left text-sm ${
                      selectedTown === town ? "bg-primary text-white" : "text-ink hover:bg-white"
                    }`}
                  >
                    {town}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setLocationModalOpen(false)}
              className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-active"
            >
              선택 완료
            </button>
          </div>
        </div>
      )}

      {/* Result modal */}
      {resultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-8 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-primary mb-1">오늘의 추천</p>
              <h3 className="text-xl font-bold text-ink">이런 곳은 어때요?</h3>
            </div>

            {recommendError ? (
              <p className="text-center text-sm text-red-500 py-10">{recommendError}</p>
            ) : !current ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Map */}
                <div className="relative mb-5 h-48 w-full overflow-hidden rounded-2xl border border-hairline-soft">
                  <div ref={mapRef} className="absolute inset-0 bg-surface-strong" />
                  <button
                    onClick={() => {
                      if (!map || !navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const center = new window.kakao.maps.LatLng(
                            pos.coords.latitude,
                            pos.coords.longitude
                          );
                          map.setCenter(center);
                        },
                        () => alert("현재 위치를 가져올 수 없습니다.")
                      );
                    }}
                    className="absolute bottom-2 right-2 flex items-center justify-center rounded-lg border border-hairline bg-surface/90 p-1.5 text-muted shadow-sm hover:bg-white"
                    aria-label="현재 위치"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>

                {/* Draft card */}
                <div className="rounded-2xl bg-surface border border-hairline-soft overflow-hidden shadow-sm">
                  <div className="aspect-[16/10] w-full bg-primary-soft flex items-center justify-center text-7xl">
                    {categoryEmoji[categoryLabel(current.category)] || "🍽\uFE0F"}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary-active">
                        {categoryLabel(current.category)}
                      </span>
                      <span className="rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                        {selectedMood}
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold text-ink">{current.name}</h4>
                    <p className="mt-1 text-sm text-muted">
                      {current.region1} {current.region2} {current.region3}
                    </p>

                    <div className="mt-4 space-y-1.5 text-sm text-body">
                      <p>{current.roadAddress}</p>
                      <p className="text-muted-soft">{current.address}</p>
                      <p>전화: {current.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <button
                    onClick={handleDecide}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-active transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    여기로 결정
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={recommendLoading}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-hairline bg-surface py-3 text-sm font-bold text-ink hover:bg-surface-soft transition-colors disabled:opacity-70"
                  >
                    <RotateCcw className="h-4 w-4" />
                    다른곳 추천
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-hairline bg-surface py-3 text-sm font-bold text-ink hover:bg-surface-soft transition-colors"
                  >
                    <Bookmark className="h-4 w-4" />
                    리스트 저장
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
