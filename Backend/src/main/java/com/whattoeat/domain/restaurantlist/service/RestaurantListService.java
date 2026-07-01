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
import com.whattoeat.global.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


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
    public Page<RestaurantList> findAllByUserId(Long userId, Pageable pageable) {
        return restaurantListRepository.findByUserIdOrderByIdDesc(userId, pageable);
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

        // 식당리스트아이템에 식당 중복으로 넣는지 체크 / 수정때는 메모, 순서만 바꾸기 때문에 삭제 후 다시 추가해야함
        if(restaurantListItemRepository.existsByRestaurantListIdAndRestaurantId(listId, restaurantId)) {
            throw new DuplicateRestaurantListItemException(restaurantId);
        }

        int nextOrderIndex;

        if(orderIndex == null) {
            Integer maxOrderIndex = restaurantListItemRepository.findMaxOrderIndexByListId(listId);
            nextOrderIndex = maxOrderIndex == null ? 1 : maxOrderIndex + 1;
        } else {
            nextOrderIndex = orderIndex;

            restaurantListItemRepository.incOrderIndex(
                    listId,
                    nextOrderIndex
            );
        }

        RestaurantListItem restaurantListItem = new RestaurantListItem(
                restaurantList,
                restaurant,
                memo,
                nextOrderIndex
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
    public Page<RestaurantList> findAll(Pageable pageable) {
        return restaurantListRepository.findAll(pageable);
    }

    // 전체 식당 리스트 단건 조회
    @Transactional(readOnly = true)
    public RestaurantList findById(Long id) {
        return restaurantListRepository.findById(id)
                .orElseThrow(() -> new ListNotFoundException(id));
    }
}
