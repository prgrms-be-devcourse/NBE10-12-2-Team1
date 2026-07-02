package com.whattoeat.domain.feedlike.dto;

public record FeedLikeStatusResponse(
        Long feedId,
        boolean liked) {

    public static FeedLikeStatusResponse of(Long feedId, boolean liked) {
        return new FeedLikeStatusResponse(feedId, liked);
    }
}
