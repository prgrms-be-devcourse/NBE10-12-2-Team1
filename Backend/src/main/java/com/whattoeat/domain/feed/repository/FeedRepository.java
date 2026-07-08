package com.whattoeat.domain.feed.repository;

import com.whattoeat.domain.feed.entity.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;


public interface FeedRepository extends JpaRepository<Feed, Long> {
    Page<Feed> findAllByOrderByIdDesc(Pageable pageable);

    Page<Feed> findByUserId(Long userId, Pageable pageable);
    Page<Feed> findByRestaurantId(Long restaurantId, Pageable pageable);

    Page<Feed> findByUser_IdIn(Collection<Long> userIds, Pageable pageable);
    Page<Feed> findByUser_IdInOrderByIdDesc(Collection<Long> userIds, Pageable pageable);
    List<Feed> findByUser_IdNotIn(Collection<Long> userIds);
}
