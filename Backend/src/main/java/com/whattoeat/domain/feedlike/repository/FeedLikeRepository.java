package com.whattoeat.domain.feedlike.repository;

import com.whattoeat.domain.feedlike.entity.FeedLike;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedLikeRepository extends JpaRepository<FeedLike, Long> {

    boolean existsByFeed_IdAndUser_Id(Long feedId, Long userId);

    Optional<FeedLike> findByFeed_IdAndUser_Id(Long feedId, Long userId);

    void deleteByFeed_IdAndUser_Id(Long feedId, Long userId);
}
