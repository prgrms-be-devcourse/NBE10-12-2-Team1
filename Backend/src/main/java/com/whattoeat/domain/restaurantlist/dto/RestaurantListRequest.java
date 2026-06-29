package com.whattoeat.domain.restaurantlist.dto;

import com.whattoeat.domain.restaurant.entity.MoodTag;

public record RestaurantListRequest(
        String title,
        String description,
        MoodTag moodTag
) {
}
