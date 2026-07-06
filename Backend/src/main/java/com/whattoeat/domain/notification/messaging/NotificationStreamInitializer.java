package com.whattoeat.domain.notification.messaging;

import com.whattoeat.domain.feed.messaging.FeedStreamPublisher;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationStreamInitializer {

    private static final String GROUP = "notification-group";
    private static final String CONSUMER = "notification-consumer-1";
    private static final long RETRY_INTERVAL_MILLIS = 5_000L;

    private final RedisTemplate<String, String> redisTemplate;
    private final StreamMessageListenerContainer<String, MapRecord<String, String, String>> container;
    private final FeedCreatedStreamListener feedCreatedStreamListener;

    private Thread subscriberThread;

    @PostConstruct
    public void init() {
        // Redis 연결을 별도 스레드에서 시도한다 - Redis가 떠 있지 않아도
        // 애플리케이션/테스트 컨텍스트 기동이 막히지 않도록 하기 위함
        subscriberThread = new Thread(this::subscribeWithRetry, "notification-stream-init");
        subscriberThread.setDaemon(true);
        subscriberThread.start();
    }

    private void subscribeWithRetry() {
        while (!Thread.currentThread().isInterrupted() && !container.isRunning()) {
            if (trySubscribe()) {
                return;
            }

            try {
                Thread.sleep(RETRY_INTERVAL_MILLIS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    private boolean trySubscribe() {
        try {
            redisTemplate.opsForStream()
                    .createGroup(FeedStreamPublisher.STREAM_KEY, ReadOffset.from("0"), GROUP);
        } catch (Exception e) {
            log.debug("Consumer group '{}' already exists on stream '{}'", GROUP, FeedStreamPublisher.STREAM_KEY);
        }

        try {
            container.receiveAutoAck(
                    Consumer.from(GROUP, CONSUMER),
                    StreamOffset.create(FeedStreamPublisher.STREAM_KEY, ReadOffset.lastConsumed()),
                    feedCreatedStreamListener
            );

            container.start();
            log.info("알림 스트림 컨슈머를 시작했습니다.");
            return true;
        } catch (Exception e) {
            log.warn("알림 스트림 컨슈머를 시작하지 못했습니다. {}초 후 재시도합니다: {}",
                    RETRY_INTERVAL_MILLIS / 1000, e.getMessage());
            return false;
        }
    }

    @PreDestroy
    public void shutdown() {
        if (subscriberThread != null) {
            subscriberThread.interrupt();
        }
        container.stop();
    }
}
