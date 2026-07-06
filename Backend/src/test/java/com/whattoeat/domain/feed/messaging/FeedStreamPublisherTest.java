package com.whattoeat.domain.feed.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StreamOperations;

@ExtendWith(MockitoExtension.class)
class FeedStreamPublisherTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private StreamOperations<String, String, String> streamOperations;

    private FeedStreamPublisher feedStreamPublisher;

    @Test
    @DisplayName("피드 생성 이벤트를 지정된 stream key로 발행한다")
    void publish_success() {
        feedStreamPublisher = new FeedStreamPublisher(redisTemplate);
        given(redisTemplate.<String, String>opsForStream()).willReturn(streamOperations);

        feedStreamPublisher.publish(10L, 1L);

        ArgumentCaptor<MapRecord<String, String, String>> captor = ArgumentCaptor.forClass(MapRecord.class);
        verify(streamOperations).add(captor.capture());

        MapRecord<String, String, String> record = captor.getValue();
        assertThat(record.getStream()).isEqualTo(FeedStreamPublisher.STREAM_KEY);
        assertThat(record.getValue()).containsEntry("feedId", "10");
        assertThat(record.getValue()).containsEntry("authorId", "1");
    }
}
