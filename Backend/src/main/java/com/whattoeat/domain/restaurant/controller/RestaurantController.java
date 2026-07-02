package com.whattoeat.domain.restaurant.controller;

import com.whattoeat.domain.restaurant.dto.RestaurantRequest;
import com.whattoeat.domain.restaurant.dto.RestaurantResponse;
import com.whattoeat.domain.restaurant.entity.Category;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurant.service.RestaurantKakaoService;
import com.whattoeat.domain.restaurant.service.RestaurantService;
import com.whattoeat.global.rsData.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final RestaurantKakaoService restaurantKakaoService;

    //식당 추천조회
    @GetMapping("/recommend")
    public RsData<RestaurantResponse.Recommend> recommend(
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) String region1,
            @RequestParam(required = false) String region2,
            @RequestParam(required = false) String region3
    ) {
        RestaurantResponse.Recommend restaurant = new RestaurantResponse.Recommend(
                restaurantService.recommend(category, region1, region2, region3)
        );
        return RsData.success(restaurant, "식당 추천이 완료되었습니다.");
    }

    // 카카오 검색만 하고, DB 저장 안함
    @GetMapping("/search")
    public RsData<List<RestaurantResponse.KakaoRestaurant>> searchFromKakao(
            @RequestParam String keyword,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double lat,
            @RequestParam(defaultValue = "1000") Integer radius,
            @RequestParam(defaultValue = "1") Integer page
    ) {
        List<RestaurantResponse.KakaoRestaurant> result = restaurantKakaoService.searchByKeyword(
                keyword,
                lng,
                lat,
                radius,
                page
        );

        return RsData.success(result, "카카오 장소 검색 결과입니다.");
    }

    // 프론트에서 선택한 식당만 저장
    @PostMapping
    public RsData<RestaurantResponse.Recommend> saveSelectedRestaurant(
            @Valid @RequestBody RestaurantRequest.FromKakao request
    ) {
        Restaurant restaurant = restaurantService.saveGetKakao(request);

        return RsData.success(
                new RestaurantResponse.Recommend(restaurant),
                "식당이 저장되었습니다."
        );
    }

    // 식당 저장된건지 확인용
    @GetMapping
    public RsData<List<RestaurantResponse.Recommend>> getRestaurants() {
        List<RestaurantResponse.Recommend> result = restaurantService.findAll()
                .stream()
                .map(RestaurantResponse.Recommend::new)
                .toList();

        return RsData.success(result, "저장된 식당 목록입니다.");
    }

}
