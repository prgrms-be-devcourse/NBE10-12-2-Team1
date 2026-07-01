package com.whattoeat.domain.restaurant.service;

import com.whattoeat.domain.restaurant.entity.Category;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.global.exception.RestaurantNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
