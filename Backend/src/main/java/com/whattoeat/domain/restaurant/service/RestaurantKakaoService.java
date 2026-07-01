package com.whattoeat.domain.restaurant.service;

import com.whattoeat.domain.restaurant.dto.RestaurantResponse;
import com.whattoeat.external.kakao.client.KakaoMapApiClient;
import com.whattoeat.external.kakao.dto.KakaoPlaceDocument;
import com.whattoeat.external.kakao.dto.KakaoPlaceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantKakaoService {

    private final KakaoMapApiClient kakaoMapApiClient;

    public List<RestaurantResponse.KakaoRestaurant> searchByKeyword(
            String keyword,
            Double lng,
            Double lat,
            Integer radius,
            Integer page
    ) {
        KakaoPlaceResponse response = kakaoMapApiClient.searchByKeyword(
                keyword,
                lng,
                lat,
                radius,
                page
        );

        return response.getDocuments().stream()
                .map(this::toKakaoRestaurant)
                .toList();
    }

    private RestaurantResponse.KakaoRestaurant toKakaoRestaurant(KakaoPlaceDocument document) {
        String address = firstNonBlank(
                document.getAddressName(),
                document.getRoadAddressName()
        );

        AddressParts addressParts = parseAddress(address);

        return new RestaurantResponse.KakaoRestaurant(
                document.getId(),
                document.getPlaceName(),
                document.getCategoryName(),
                address,
                document.getRoadAddressName(),
                addressParts.region1(),
                addressParts.region2(),
                addressParts.region3(),
                document.getPhone(),
                document.getY(), // lat
                document.getX()  // lng
        );
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }

        if (second != null && !second.isBlank()) {
            return second;
        }

        return "주소없음";
    }

    private AddressParts parseAddress(String addressName) {
        if (addressName == null || addressName.isBlank()) {
            return new AddressParts("지역없음", "지역없음", null);
        }

        String[] parts = addressName.trim().split("\\s+");

        return new AddressParts(
                parts.length > 0 ? parts[0] : "지역없음",
                parts.length > 1 ? parts[1] : "지역없음",
                parts.length > 2 ? parts[2] : null
        );
    }

    private record AddressParts(
            String region1,
            String region2,
            String region3
    ) {
    }
}
