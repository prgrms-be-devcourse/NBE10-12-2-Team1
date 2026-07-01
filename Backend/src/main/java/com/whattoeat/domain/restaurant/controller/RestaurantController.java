package com.whattoeat.domain.restaurant.controller;

import com.whattoeat.domain.restaurant.dto.RestaurantResponse;
import com.whattoeat.domain.restaurant.entity.Category;
import com.whattoeat.domain.restaurant.service.RestaurantService;
import com.whattoeat.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

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
}
