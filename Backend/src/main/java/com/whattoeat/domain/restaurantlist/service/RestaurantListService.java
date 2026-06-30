package com.whattoeat.domain.restaurantlist.service;

import com.whattoeat.domain.restaurant.entity.MoodTag;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;
import com.whattoeat.domain.restaurantlist.repository.RestaurantListItemRepository;
import com.whattoeat.domain.restaurantlist.repository.RestaurantListRepository;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.ListNotFoundException;
import com.whattoeat.global.exception.RestaurantListItemNotFoundException;
import com.whattoeat.global.exception.RestaurantNotFoundException;
import com.whattoeat.global.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RestaurantListService {
    private final RestaurantListRepository restaurantListRepository;
    private final UserRepository userRepository;
    private final RestaurantListItemRepository restaurantListItemRepository;
    private final RestaurantRepository restaurantRepository;

    public RestaurantList create(Long userId, String title, String description, MoodTag moodTag) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        RestaurantList restaurantList = new RestaurantList(
                user,
                title,
                description,
                moodTag
        );

        return restaurantListRepository.save(restaurantList);
    }

    // 맛집 리스트 다건 조회
    @Transactional(readOnly = true)
    public List<RestaurantList> findAllByUserId(Long userId) {
        return restaurantListRepository.findByUserIdOrderByIdDesc(userId);
    }


    // 맛집 리스트 단건 조회
    @Transactional(readOnly = true)
    public RestaurantList findByIdAndUserId(Long id, Long userId) {
        return restaurantListRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ListNotFoundException(id));
    }

    public RestaurantListItem addItem(
            Long userId,
            Long listId,
            Long restaurantId,
            String memo,
            Integer orderIndex
    ) {
        RestaurantList restaurantList = restaurantListRepository.findByIdAndUserId(listId, userId)
                .orElseThrow(() -> new ListNotFoundException(listId));

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RestaurantNotFoundException(restaurantId));

        RestaurantListItem restaurantListItem = new RestaurantListItem(
                restaurantList,
                restaurant,
                memo,
                orderIndex
        );

        return restaurantListItemRepository.save(restaurantListItem);
    }

    public RestaurantListItem updateItem(
            Long listId,
            Long itemId,
            Long userId,
            Integer orderIndex,
            String memo
    ) {
        // 식당 있는지 확인
        restaurantListRepository.findById(listId)
                .orElseThrow(() -> new ListNotFoundException(listId));

        RestaurantListItem item =  restaurantListItemRepository.findListItem(itemId, listId, userId)
                .orElseThrow(() -> new RestaurantListItemNotFoundException(itemId));

        item.updateListItem(orderIndex, memo);

        return item;
    }

    // 식당 리스트 아이템 삭제
    public void deleteItem(Long listId, Long itemId, Long userId) {
        RestaurantListItem item = restaurantListItemRepository.findListItem(itemId, listId, userId)
                .orElseThrow(() -> new RestaurantListItemNotFoundException(itemId));

        restaurantListItemRepository.delete(item);
    }

    // ============================== 전체 조회 =================================
    // 전체 맛집 리스트 다건 조회
    @Transactional(readOnly = true)
    public List<RestaurantList> findAll() {
        return restaurantListRepository.findAll();
    }

    // 전체 식당 리스트 단건 조회
    @Transactional(readOnly = true)
    public RestaurantList findById(Long id) {
        return restaurantListRepository.findById(id)
                .orElseThrow(() -> new ListNotFoundException(id));
    }
}
