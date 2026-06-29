package com.whattoeat.domain.feed.service;

import com.whattoeat.domain.feed.dto.request.FeedCreateRequest;
import com.whattoeat.domain.feed.dto.request.FeedUpdateRequest;
import com.whattoeat.domain.feed.dto.response.FeedDetailResponse;
import com.whattoeat.domain.feed.dto.response.FeedListResponse;
import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedService {
    private final FeedRepository feedRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public FeedDetailResponse createFeed(User user, FeedCreateRequest feedCreateRequest) {
        Restaurant restaurant = feedCreateRequest.restaurantId() != null
                ? restaurantRepository.findById(feedCreateRequest.restaurantId()).orElse(null)
                : null;
        Feed feed = feedRepository.save(feedCreateRequest.toEntity(user, restaurant));
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
            feeds = feedRepository.findAll(pageable);
        }
        return feeds.map(FeedListResponse::from);
    }

    @Transactional
    public FeedDetailResponse updateFeed(Long feedId, FeedUpdateRequest request) {
        Feed feed = feedRepository.findById(feedId)
                .orElseThrow(() -> new IllegalArgumentException("피드를 찾을 수 없습니다."));
        Restaurant restaurant = request.restaurantId() != null
                ? restaurantRepository.findById(request.restaurantId()).orElse(null)
                : null;
        feed.setContent(request.content());
        feed.setRestaurant(restaurant);

        return FeedDetailResponse.from(feedRepository.save(feed));
    }
}
