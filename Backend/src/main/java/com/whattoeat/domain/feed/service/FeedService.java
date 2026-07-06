package com.whattoeat.domain.feed.service;

import com.whattoeat.domain.comment.repository.CommentRepository;
import com.whattoeat.domain.feed.dto.request.FeedCreateRequest;
import com.whattoeat.domain.feed.dto.request.FeedUpdateRequest;
import com.whattoeat.domain.feed.dto.response.FeedDetailResponse;
import com.whattoeat.domain.feed.dto.response.FeedListResponse;
import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.event.FeedCreatedEvent;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.follow.repository.FollowRepository;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.global.exception.FeedNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {
    private final FeedRepository feedRepository;
    private final RestaurantRepository restaurantRepository;
    private final FollowRepository followRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final CommentRepository commentRepository;


    @Transactional
    public FeedDetailResponse createFeed(User user, FeedCreateRequest feedCreateRequest) {
        Restaurant restaurant = feedCreateRequest.restaurantId() != null
                ? restaurantRepository.findById(feedCreateRequest.restaurantId()).orElse(null)
                : null;
        Feed feed = feedRepository.save(feedCreateRequest.toEntity(user, restaurant));
        eventPublisher.publishEvent(new FeedCreatedEvent(feed.getId(), user.getId()));
        return FeedDetailResponse.from(feed);
    }

    @Transactional(readOnly = true)
    public Page<FeedListResponse> getFeeds(Long userId, Long restaurantId, Pageable pageable) {
        Page<Feed> feeds;
        if (userId != null) {
            feeds = feedRepository.findByUserId(userId, pageable);
        } else if (restaurantId != null) {
            feeds = feedRepository.findByRestaurantId(restaurantId, pageable);
        } else {
            feeds = feedRepository.findAllByOrderByIdDesc(pageable);
        }

        Map<Long, Long> commentCounts = countCommentByFeedIds(feeds.getContent());

        return feeds.map(feed -> FeedListResponse
                .from(feed, commentCounts.getOrDefault(feed.getId(),0L)));
    }

    private Map<Long, Long> countCommentByFeedIds(List<Feed> feeds) {
        List<Long> feedIds = feeds.stream().map(Feed::getId).toList();
        if (feedIds.isEmpty()) return Map.of();
        return commentRepository.countByFeedIds(feedIds)
                .stream().collect(Collectors.toMap(
                                row -> (Long) row[0],
                                row -> row[1] == null ? 0L : ((Number) row[1]).longValue()
                        )
                );
    }

    @Transactional(readOnly = true)
    public Page<FeedListResponse> getFollowingFeeds(Long userId, Pageable pageable) {
        List<Long> followingUserIds = followRepository.findByFollower_Id(userId, Pageable.unpaged())
                .stream()
                .map(follow -> follow.getFollowing().getId())
                .toList();

        if (followingUserIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Page<Feed> feeds = feedRepository.findByUser_IdIn(followingUserIds, pageable);
        Map<Long, Long> commentCounts = countCommentByFeedIds(feeds.getContent());

        return feeds.map(feed -> FeedListResponse
                .from(feed, commentCounts.getOrDefault(feed.getId(),0L)));
    }

    @Transactional(readOnly = true)
    public Page<FeedListResponse> getRandomRecommendedFeeds(Long userId, Pageable pageable) {
        if(userId == null) return Page.empty(pageable);

        List<Long> excludedUserIds = new ArrayList<>();

        excludedUserIds.add(userId);

        List<Long> followingUserIds = followRepository.findByFollower_Id(userId, Pageable.unpaged())
                .stream()
                .map(follow -> follow.getFollowing().getId())
                .toList();

        excludedUserIds.addAll(followingUserIds);

        List<Feed> feeds = feedRepository.findByUser_IdNotIn(excludedUserIds);

        Collections.shuffle(feeds);

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), feeds.size());

        if (start >= feeds.size()) {
            return Page.empty(pageable);
        }

        Map<Long, Long> commentCounts = countCommentByFeedIds(feeds.subList(start, end));

        List<FeedListResponse> responses = feeds.subList(start, end)
                .stream()
                .map(feed -> FeedListResponse
                        .from(feed, commentCounts.getOrDefault(feed.getId(),0L)))
                .toList();

        return new PageImpl<>(responses, pageable, feeds.size());
    }

    @Transactional
    public FeedDetailResponse updateFeed(Long feedId, Long currentUserId, FeedUpdateRequest request) {
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new FeedNotFoundException(feedId));

        if (!feed.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("본인 피드만 수정할 수 있습니다.");
        }

        Restaurant restaurant = request.restaurantId() != null
                ? restaurantRepository.findById(request.restaurantId()).orElse(null)
                : null;
        feed.setContent(request.content());
        feed.setRestaurant(restaurant);

        return FeedDetailResponse.from(feedRepository.save(feed));
    }

    @Transactional
    public void deleteFeed(Long feedId, Long currentUserId) {
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new FeedNotFoundException(feedId));

        if (!feed.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("본인 피드만 삭제할 수 있습니다.");
        }

        feedRepository.delete(feed);
    }


}
