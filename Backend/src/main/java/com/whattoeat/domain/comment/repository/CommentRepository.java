package com.whattoeat.domain.comment.repository;

import com.whattoeat.domain.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByFeedId(Long feedId);

    // FeedListResponse에 댓글 수 넣기 위한 카운트 쿼리 추가
    long countByFeedId(Long feedId);
}
