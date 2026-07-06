package com.whattoeat.domain.notification.messaging;

import static org.mockito.Mockito.verify;

import com.whattoeat.domain.feed.messaging.FeedStreamPublisher;
import com.whattoeat.domain.notification.service.NotificationService;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.StreamRecords;

@ExtendWith(MockitoExtension.class)
class FeedCreatedStreamListenerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FeedCreatedStreamListener listener;

    @Test
    @DisplayName("스트림 메시지를 파싱해 알림 서비스에 전달한다")
    void onMessage_success() {
        MapRecord<String, String, String> message = StreamRecords.newRecord()
                .ofMap(Map.of("feedId", "10", "authorId", "1"))
                .withStreamKey(FeedStreamPublisher.STREAM_KEY);

        listener.onMessage(message);

        verify(notificationService).createFeedNotifications(10L, 1L);
    }
}
