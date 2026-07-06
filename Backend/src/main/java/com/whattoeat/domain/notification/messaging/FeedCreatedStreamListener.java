package com.whattoeat.domain.notification.messaging;

import com.whattoeat.domain.notification.service.NotificationService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FeedCreatedStreamListener implements StreamListener<String, MapRecord<String, String, String>> {

    private final NotificationService notificationService;

    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        Map<String, String> value = message.getValue();

        Long feedId = Long.valueOf(value.get("feedId"));
        Long authorId = Long.valueOf(value.get("authorId"));

        notificationService.createFeedNotifications(feedId, authorId);
    }
}
