"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Navigation } from "lucide-react";
import AppShell, { SidebarProfile, SidebarCard } from "@/components/AppShell";
import { apiFetchJson } from "@/lib/api";

declare global {
  interface Window {
    kakao?: {
      maps?: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: object) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        LatLngBounds: new () => unknown;
        Marker: new (options: { position: unknown; map?: unknown }) => unknown;
        services?: {
          Places: new () => {
            keywordSearch: (
              query: string,
              callback: (data: KakaoPlaceItem[], status: string) => void,
              options?: object
            ) => void;
          };
          Status: { OK: string };
        };
      };
    };
  }
}

interface KakaoPlaceItem {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  y: string;
  x: string;
}

interface KakaoMarker {
  setMap: (map: unknown | null) => void;
}

interface KakaoMap {
  setCenter: (center: unknown) => void;
  setBounds: (bounds: unknown) => void;
}

interface KakaoLatLngBounds {
  extend: (position: unknown) => void;
}

const categories = ["전체", "한식", "일식", "양식", "중식", "분식", "카페"];

const categoryLabelMap: Record<string, string> = {
  KOREAN: "한식",
  JAPANESE: "일식",
  WESTERN: "양식",
  CHINESE: "중식",
  SNACK: "분식",
  CAFE: "카페",
  ASIAN: "아시안",
  ETC: "기타",
};

interface HotPlace {
  id: number;
  name: string;
  category: string;
  region2: string;
}

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

function matchesCategory(item: KakaoRestaurant, category: string): boolean {
  if (category === "전체") return true;
  return item.category.includes(category);
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("을지로 맛집");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [results, setResults] = useState<KakaoRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hotPlaces, setHotPlaces] = useState<HotPlace[]>([]);
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY;

    const initMap = () => {
      if (!mapRef.current || !window.kakao?.maps) return;
      const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 5,
      });
      setMap(kakaoMap);
    };

    const loadMap = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(initMap);
      }
    };

    if (window.kakao?.maps) {
      loadMap();
      return;
    }

    const existing = document.getElementById("kakao-map-sdk") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", loadMap);
      const check = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(check);
          loadMap();
        }
      }, 100);
      return () => clearInterval(check);
    }

    if (!kakaoKey) {
      const raf = requestAnimationFrame(() =>
        setError("카카오맵 JS 키가 설정되지 않았습니다. .env.local을 확인하세요.")
      );
      return () => cancelAnimationFrame(raf);
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "origin";
    script.onload = loadMap;
    script.onerror = () => setError("카카오맵 SDK를 불러오지 못했습니다. JS 키와 도메인 등록을 확인하세요.");
    document.head.appendChild(script);
  }, []);

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
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const filtered = results.filter((r) => matchesCategory(r, activeCategory));
    if (filtered.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds() as KakaoLatLngBounds;
    filtered.forEach((r) => {
      const position = new window.kakao.maps.LatLng(r.lat, r.lng);
      const marker = new window.kakao.maps.Marker({ position, map }) as KakaoMarker;
      markersRef.current.push(marker);
      bounds.extend(position);
    });
    map.setBounds(bounds);
  }, [map, results, activeCategory]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation || !map) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const center = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        map.setCenter(center);
      },
      () => {
        alert("현재 위치를 가져올 수 없습니다.");
      }
    );
  };

  const fetchSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    if (!window.kakao?.maps?.services) {
      setError("카카오맵 SDK를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(
      query.trim(),
      (data: KakaoPlaceItem[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const mapped: KakaoRestaurant[] = data.map((item) => {
            const addressParts = item.address_name ? item.address_name.split(" ") : [];
            return {
              kakaoPlaceId: item.id,
              name: item.place_name,
              category: item.category_name,
              address: item.address_name,
              roadAddress: item.road_address_name,
              region1: addressParts[0] || "",
              region2: addressParts[1] || "",
              region3: addressParts[2] || "",
              phone: item.phone,
              lat: parseFloat(item.y),
              lng: parseFloat(item.x),
            };
          });
          setResults(mapped);
        } else {
          setError("검색 결과를 불러오지 못했습니다.");
          setResults([]);
        }
        setLoading(false);
      },
      {
        category_group_code: "FD6",
        size: 15,
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSearch();
  };

  const handleSelect = async (restaurant: KakaoRestaurant) => {
    // 먼저 kakaoPlaceId로 DB에 저장된 식당이 있는지 확인
    const findRes = await apiFetchJson<{ id: number }>(
      `/api/v1/restaurants?kakaoPlaceId=${restaurant.kakaoPlaceId}`
    );

    if (findRes.ok && findRes.data) {
      router.push(`/restaurant/${findRes.data.id}`);
      return;
    }

    // DB에 없으면 저장 후 이동
    const saveRes = await apiFetchJson<{ id: number }>("/api/v1/restaurants", {
      method: "POST",
      body: JSON.stringify({
        kakaoPlaceId: restaurant.kakaoPlaceId,
        name: restaurant.name,
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
    });

    if (saveRes.ok && saveRes.data) {
      router.push(`/restaurant/${saveRes.data.id}`);
    } else {
      alert(saveRes.message || "식당 저장에 실패했습니다.");
    }
  };

  const filtered = results.filter((r) => matchesCategory(r, activeCategory));

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
                      <p className="text-sm text-muted">{categoryLabelMap[p.category] || p.category} · {p.region2 || "-"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SidebarCard>
        </div>
      }
    >
      <div className="relative h-[calc(100vh-6.5rem)] overflow-hidden rounded-2xl border border-hairline-soft">
        {/* Map — full main background */}
        <div ref={mapRef} className="absolute inset-0 bg-surface-strong" />

        <button
          onClick={handleCurrentLocation}
          className="absolute bottom-4 right-4 flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-surface-soft px-4 py-2 text-xs font-bold text-ink shadow-sm transition-colors hover:bg-white"
        >
          <Navigation className="h-3.5 w-3.5 text-primary" />
          현재 위치
        </button>

        {/* Top floating search & filter bar */}
        <div className="absolute inset-x-4 top-4 z-10 md:inset-x-auto md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-hairline-soft bg-surface/90 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-soft px-4 py-2.5">
              <Search className="h-5 w-5 text-muted" />
              {mounted && (
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-ink outline-hidden placeholder:text-muted-soft"
                  placeholder="지역, 식당명, 음식 종류를 입력하세요"
                />
              )}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-active disabled:opacity-70"
              >
                {loading ? "검색 중..." : "검색"}
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    cat === activeCategory
                      ? "bg-primary text-white"
                      : "bg-surface-soft text-muted hover:bg-hairline-soft"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Bottom results sheet */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
          <div className="rounded-2xl border border-hairline-soft bg-surface/95 p-4 shadow-lg backdrop-blur">
            {error ? (
              <p className="text-center text-sm text-red-500 py-4">{error}</p>
            ) : (
              <>
                <p className="mb-3 text-sm font-bold text-ink">
                  검색 결과 <span className="text-primary">{filtered.length}개</span>
                </p>

                <div className="flex gap-4 overflow-x-auto pb-2">
                  {filtered.map((r) => (
                    <button
                      key={r.kakaoPlaceId}
                      onClick={() => handleSelect(r)}
                      className="shrink-0 text-left"
                    >
                      <article className="group w-64 overflow-hidden rounded-2xl border border-hairline-soft bg-surface shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
                        <div className="h-32 w-full overflow-hidden bg-surface-strong">
                          <img
                            src="/restaurant-placeholder.png"
                            alt={r.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-base font-bold text-ink">{r.name}</h3>
                            <span className="shrink-0 text-xs text-muted">{r.category}</span>
                          </div>
                          <p className="mt-2 text-xs leading-4 text-body line-clamp-2">{r.roadAddress || r.address}</p>
                        </div>
                      </article>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
