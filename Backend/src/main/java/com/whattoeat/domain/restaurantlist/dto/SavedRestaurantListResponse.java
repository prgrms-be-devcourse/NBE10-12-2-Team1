package com.whattoeat.domain.restaurantlist.dto;

import com.whattoeat.domain.restaurant.entity.MoodTag;
import com.whattoeat.domain.restaurantlist.entity.SavedRestaurantList;

import java.time.LocalDateTime;

public record SavedRestaurantListResponse(
        Long savedId,
        Long restaurantListId,
        Long ownerId,
        String ownerName,
        String title,
        String description,
        MoodTag moodTag,
        LocalDateTime createAt
) {
    public static SavedRestaurantListResponse from(SavedRestaurantList savedRestaurantList) {
        return new SavedRestaurantListResponse(
                savedRestaurantList.getId(),
                savedRestaurantList.getRestaurantList().getId(),
                savedRestaurantList.getRestaurantList().getUser().getId(),
                savedRestaurantList.getRestaurantList().getUser().getNickname(),
                savedRestaurantList.getRestaurantList().getTitle(),
                savedRestaurantList.getRestaurantList().getDescription(),
                savedRestaurantList.getRestaurantList().getMoodTag(),
                savedRestaurantList.getCreatedAt()
        );
    }
}
