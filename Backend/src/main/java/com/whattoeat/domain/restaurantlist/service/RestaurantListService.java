package com.whattoeat.domain.restaurantlist.service;

import com.whattoeat.domain.restaurant.entity.MoodTag;
import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import com.whattoeat.domain.restaurantlist.repository.RestaurantListRepository;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantListService {
    private final RestaurantListRepository restaurantListRepository;
    private final UserRepository userRepository;

    public RestaurantList create(Long userId, String title, String description, MoodTag moodTag) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        RestaurantList restaurantList = new RestaurantList(
                user,
                title,
                description,
                moodTag
        );

        return restaurantListRepository.save(restaurantList);
    }

    // 맛집 리스트 다건 조회
    public List<RestaurantList> findAllByUserId(Long userId) {
        return restaurantListRepository.findByUserIdOrderByIdDesc(userId);
    }


    // 맛집 리스트 단건 조회
    public RestaurantList findByIdAndUserId(Long id, Long userId) {
        return restaurantListRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 맛집 리스트입니다."));
    }
}
