package com.whattoeat.domain.feedlike.dto;

import com.whattoeat.domain.feedlike.entity.FeedLike;
import java.time.LocalDateTime;

public record FeedLikeResponse(
        Long feedLikeId,
        Long feedId,
        Long userId,
        LocalDateTime createdAt) {

    public static FeedLikeResponse from(FeedLike feedLike) {
        return new FeedLikeResponse(
                feedLike.getId(),
                feedLike.getFeed().getId(),
                feedLike.getUser().getId(),
                feedLike.getCreatedAt());
    }
}
