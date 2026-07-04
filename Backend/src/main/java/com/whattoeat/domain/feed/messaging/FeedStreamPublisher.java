package com.whattoeat.domain.feed.messaging;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FeedStreamPublisher {

    public static final String STREAM_KEY = "notification:feed-created";

    private final RedisTemplate<String, String> redisTemplate;

    public void publish(Long feedId, Long authorId) {
        Map<String, String> value = Map.of(
                "feedId", String.valueOf(feedId),
                "authorId", String.valueOf(authorId)
        );

        redisTemplate.opsForStream().add(
                StreamRecords.newRecord()
                        .ofMap(value)
                        .withStreamKey(STREAM_KEY)
        );
    }
}
