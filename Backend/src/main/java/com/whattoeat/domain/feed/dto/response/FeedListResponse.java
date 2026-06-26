package com.whattoeat.domain.feed.dto.response;

import java.time.LocalDateTime;

public record FeedListResponse(
        Long feedId,
        String content,
        String nickname,
        int likeCount,
        LocalDateTime createdAt
) {
}
