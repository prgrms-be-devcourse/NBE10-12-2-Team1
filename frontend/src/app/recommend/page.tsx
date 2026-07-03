"use client";

import { useState } from "react";
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

const hotPlaces = [
  { name: "연남동 스시 오마카세", category: "일식", likes: 234 },
  { name: "성수동 카페거리", category: "카페", likes: 189 },
  { name: "이태원 양식당", category: "양식", likes: 156 },
];

const categories = ["한식", "일식", "양식", "중식", "분식", "카페", "아시안", "피자", "치킨"];
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
const moods = ["데이트", "혼밥", "회식", "야식", "가족", "친구"];
const sorts = [
  { key: "random", label: "랜덤", icon: Shuffle },
  { key: "distance", label: "거리순", icon: Navigation },
];

const locationData: Record<string, string[]> = {
  서울: ["전체", "강남구", "강동구", "마포구", "종로구", "용산구", "중구"],
  부산: ["전체", "해운대구", "수영구", "남구", "북구"],
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

const mockRecommendations = [
  {
    id: 1,
    name: "을지로 칼국수",
    category: "한식",
    mood: "혼밥",
    location: "서울 중구 을지로3가",
    address: "서울 중구 을지로 12",
    roadAddress: "서울 중구 을지로 12길 5",
    phone: "02-1234-5678",
    distance: "120m",
    postCount: 128,
    tags: ["#45대 칼국수", "#을지로핫플", "#혼밥"],
  },
  {
    id: 2,
    name: "연남동 스시 오마카세",
    category: "일식",
    mood: "데이트",
    location: "서울 마포구 연남동",
    address: "서울 마포구 연남동 123",
    roadAddress: "서울 마포구 성미산로 17",
    phone: "02-2345-6789",
    distance: "450m",
    postCount: 86,
    tags: ["#30천원대 오마카세", "#데이트", "#연남동"],
  },
  {
    id: 3,
    name: "이태원 양식당",
    category: "양식",
    mood: "회식",
    location: "서울 용산구 이태원동",
    address: "서울 용산구 이태원동 45",
    roadAddress: "서울 용산구 이태원로 123",
    phone: "02-3456-7890",
    distance: "890m",
    postCount: 54,
    tags: ["#60대 양식", "#회식", "#이태원"],
  },
];

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
  const [currentIndex, setCurrentIndex] = useState(0);

  const locationLabel =
    selectedCity +
    (selectedDistrict === "전체" ? "" : ` ${selectedDistrict}`) +
    (selectedTown === "전체" ? "" : ` ${selectedTown}`);

  const current = mockRecommendations[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockRecommendations.length);
  };

  const handleDecide = () => {
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
              {hotPlaces.map((p, i) => (
                <div key={p.name} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-bold text-ink">{p.name}</p>
                    <p className="text-sm text-muted">{p.category} · 좋아요 {p.likes}</p>
                  </div>
                </div>
              ))}
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
              onClick={() => {
                setResultModalOpen(true);
                setCurrentIndex(0);
              }}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-active transition-colors"
            >
              추천 받기
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
      {resultModalOpen && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-8 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-primary mb-1">오늘의 추천</p>
              <h3 className="text-xl font-bold text-ink">이런 곳은 어때요?</h3>
            </div>

            {/* Draft card */}
            <div className="rounded-2xl bg-surface border border-hairline-soft overflow-hidden shadow-sm">
              <div className="aspect-[16/10] w-full bg-primary-soft flex items-center justify-center text-7xl">
                {categoryEmoji[current.category] || "🍽\uFE0F"}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary-active">
                    {current.category}
                  </span>
                  <span className="rounded-full bg-tag-mood px-2.5 py-1 text-xs font-bold text-ink">
                    {current.mood}
                  </span>
                </div>
                <h4 className="text-2xl font-bold text-ink">{current.name}</h4>
                <p className="mt-1 text-sm text-muted">
                  {current.location} · {current.distance}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {current.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-body">
                  <p>{current.roadAddress}</p>
                  <p className="text-muted-soft">{current.address}</p>
                  <p>전화: {current.phone}</p>
                  <p>포스트 {current.postCount}개</p>
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
                className="flex items-center justify-center gap-1.5 rounded-xl border border-hairline bg-surface py-3 text-sm font-bold text-ink hover:bg-surface-soft transition-colors"
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
          </div>
        </div>
      )}
    </AppShell>
  );
}
