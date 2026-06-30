package com.whattoeat.domain.restaurantlist.dto;

import com.whattoeat.domain.restaurant.entity.MoodTag;
import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;

import java.time.LocalDateTime;
import java.util.List;

public class RestaurantListResponse {
    // 목록 조회 전체 응답
    public record RestaurantListsResponse(
            List<RestaurantLists> lists,
            int totalPages,
            long totalElements
    ) {
    }

    // 다건 조회용
    public record RestaurantLists(
            Long id,
            Long userId,
            String nickname,
            String title,
            String description,
            MoodTag moodTag,
            int itemCount,
            LocalDateTime createdAt
    ) {
        public RestaurantLists(RestaurantList restaurantList) {
            this(
                    restaurantList.getId(),
                    restaurantList.getUser().getId(),
                    restaurantList.getUser().getNickname(),
                    restaurantList.getTitle(),
                    restaurantList.getDescription(),
                    restaurantList.getMoodTag(),
                    restaurantList.getItems().size(), // ListItem 연결후 itemCount로 변경예정
                    restaurantList.getCreatedAt()
            );
        }
    }

    // 단건조회용
    public record RestaurantListDetail(
            Long listId,
            Long userId,
            String nickname,
            String title,
            String description,
            MoodTag moodTag//,
//            List<RestaurantListItem> items
    ) {
        public RestaurantListDetail(RestaurantList restaurantList) {
            this(
                    restaurantList.getId(),
                    restaurantList.getUser().getId(),
                    restaurantList.getUser().getNickname(),
                    restaurantList.getTitle(),
                    restaurantList.getDescription(),
                    restaurantList.getMoodTag()//,
//                    restaurantList.getItems()
//                            .stream()
//                            .map(RestaurantListItem::new)
//                            .toList()
            );
        }
    }

    // 단건 상세 안의 식당 아이템
    public record RestaurantListItemRes(
            Long id,
            Long listId,
            Long restaurantId,
            String restaurantName,
            String memo,
            Integer orderIndex
    ) {
        public RestaurantListItemRes(RestaurantListItem item) {
            this(
                    item.getId(),
                    item.getRestaurantList().getId(),
                    item.getRestaurant().getId(),
                    item.getRestaurant().getName(),
                    item.getMemo(),
                    item.getOrderIndex()
            );
        }
    }
}
