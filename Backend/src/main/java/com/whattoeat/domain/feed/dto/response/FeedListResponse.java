package com.whattoeat.domain.feed.dto.response;

import com.whattoeat.domain.feed.entity.Feed;

import java.time.LocalDateTime;

public record FeedListResponse(
        Long feedId,
        String content,
        String nickname,
        int likeCount,
        LocalDateTime createdAt
) {
    public static FeedListResponse from(Feed feed) {
        return new FeedListResponse(
                feed.getId(),
                feed.getContent(),
                feed.getUser().getNickname(),
                feed.getLikeCount(),
                feed.getCreatedAt()
        );
    }
}
