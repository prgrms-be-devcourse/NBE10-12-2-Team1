package com.whattoeat.domain.feedlike.service;

import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.feedlike.entity.FeedLike;
import com.whattoeat.domain.feedlike.repository.FeedLikeRepository;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedLikeService {

    private final FeedLikeRepository feedLikeRepository;
    private final UserRepository userRepository;
    private final FeedRepository feedRepository;

    @Transactional
    public FeedLike like(Long userId, Long feedId) {
        User user = getUser(userId);
        Feed feed = getFeed(feedId);

        if (feedLikeRepository.existsByFeed_IdAndUser_Id(feedId, userId)) {
            throw new IllegalStateException("이미 좋아요한 피드입니다.");
        }

        return feedLikeRepository.save(FeedLike.of(feed, user));
    }

    @Transactional
    public void unlike(Long userId, Long feedId) {
        getUser(userId);
        getFeed(feedId);

        FeedLike feedLike = feedLikeRepository.findByFeed_IdAndUser_Id(feedId, userId)
                .orElseThrow(() -> new IllegalArgumentException("좋아요 관계가 존재하지 않습니다."));

        feedLikeRepository.delete(feedLike);
    }

    @Transactional(readOnly = true)
    public boolean isLiked(Long userId, Long feedId) {
        return feedLikeRepository.existsByFeed_IdAndUser_Id(feedId, userId);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }

    private Feed getFeed(Long feedId) {
        return feedRepository.findById(feedId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 피드입니다."));
    }
}
