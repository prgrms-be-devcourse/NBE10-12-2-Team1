package com.whattoeat.domain.feed.repository;

import com.whattoeat.domain.feed.entity.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface FeedRepository extends JpaRepository<Feed, Long> {
    Page<Feed> findByUserId(Long userId, Pageable pageable);
    Page<Feed> findByRestaurantId(Long restaurantId, Pageable pageable);
}
