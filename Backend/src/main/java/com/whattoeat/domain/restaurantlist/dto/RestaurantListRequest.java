package com.whattoeat.domain.restaurantlist.dto;

import com.whattoeat.domain.restaurant.entity.MoodTag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;

public class RestaurantListRequest {
    public record RestaurantList(
            @NotBlank
            String title,
            String description,
            MoodTag moodTag
    ) {}

    public record RestaurantListItem(
        @NonNull
        Long restaurantId,

        @NotBlank
        String comment,

        @NotNull
        Integer orderIndex
    ) {}
}
