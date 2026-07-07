export interface KakaoPlaceItem {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  y: string;
  x: string;
}

interface KakaoPlaces {
  keywordSearch: (
    query: string,
    callback: (data: KakaoPlaceItem[], status: string) => void,
    options?: object
  ) => void;
  categorySearch: (
    categoryCode: string,
    callback: (data: KakaoPlaceItem[], status: string) => void,
    options?: object
  ) => void;
}

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
          Places: new (map?: unknown) => KakaoPlaces;
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
        };
      };
    };
  }
}
