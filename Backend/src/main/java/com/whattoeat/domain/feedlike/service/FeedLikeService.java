package com.whattoeat.domain.feedlike.service;

import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.feedlike.entity.FeedLike;
import com.whattoeat.domain.feedlike.repository.FeedLikeRepository;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.AlreadyLikedFeedException;
import com.whattoeat.global.exception.FeedLikeNotFoundException;
import com.whattoeat.global.exception.FeedNotFoundException;
import com.whattoeat.global.exception.UserNotFoundException;
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
            throw new AlreadyLikedFeedException();
        }

        return feedLikeRepository.save(FeedLike.of(feed, user));
    }

    @Transactional
    public void unlike(Long userId, Long feedId) {
        getUser(userId);
        getFeed(feedId);

        FeedLike feedLike = feedLikeRepository.findByFeed_IdAndUser_Id(feedId, userId)
                .orElseThrow(FeedLikeNotFoundException::new);

        feedLikeRepository.delete(feedLike);
    }

    @Transactional(readOnly = true)
    public boolean isLiked(Long userId, Long feedId) {
        getUser(userId);
        getFeed(feedId);
        return feedLikeRepository.existsByFeed_IdAndUser_Id(feedId, userId);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }

    private Feed getFeed(Long feedId) {
        return feedRepository.findById(feedId)
                .orElseThrow(() -> new FeedNotFoundException(feedId));
    }
}
