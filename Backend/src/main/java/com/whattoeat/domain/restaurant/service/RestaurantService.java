package com.whattoeat.domain.restaurant.service;

import com.whattoeat.domain.restaurant.dto.RestaurantRequest;
import com.whattoeat.domain.restaurant.entity.Category;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.global.exception.RestaurantNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final Random random = new Random();

    public Restaurant recommend(Category category, String region1, String region2, String region3) {
        List<Restaurant> restaurants = restaurantRepository.findRecommended(category, region1, region2, region3);
        if (restaurants.isEmpty()) {
            throw new RestaurantNotFoundException("조건에 맞는 식당이 없습니다.");
        }
        return restaurants.get(random.nextInt(restaurants.size()));
    }

    @Transactional
    public Restaurant saveGetKakao(RestaurantRequest.FromKakao request) {
        return restaurantRepository.findByKakaoPlaceId(request.kakaoPlaceId())
                .orElseGet(() -> restaurantRepository.save(
                        new Restaurant(
                                request.kakaoPlaceId(),
                                request.name(),
                                convertToCategory(request.categoryName()),
                                request.address(),
                                request.roadAddress(),
                                defaultIfBlank(request.region1(), "지역없음"),
                                defaultIfBlank(request.region2(), "지역없음"),
                                request.region3(),
                                request.phone(),
                                request.lat(),
                                request.lng()
                        )
                ));
    }

    private Category convertToCategory(String categoryName) {
        if(categoryName.contains("한식")) return Category.KOREAN;
        if(categoryName.contains("중식")) return Category.CHINESE;
        if(categoryName.contains("일식")) return Category.JAPANESE;
        if(categoryName.contains("양식")) return Category.WESTERN;
        if(categoryName.contains("카페") || categoryName.contains("디저트")) return Category.CAFE;
        if(categoryName.contains("분식")) return Category.SNACK;

        return Category.ETC;
    }

    private String defaultIfBlank(String value, String defaultValue) {
        return value == null ? defaultValue : value;
    }
}
