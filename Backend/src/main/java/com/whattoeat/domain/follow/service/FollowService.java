package com.whattoeat.domain.follow.service;

import com.whattoeat.domain.follow.entity.Follow;
import com.whattoeat.domain.follow.repository.FollowRepository;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Transactional
    public Follow follow(Long followerId, Long followingId) {
        validateSelfFollow(followerId, followingId);

        User follower = getUser(followerId);
        User following = getUser(followingId);

        if (followRepository.existsByFollower_IdAndFollowing_Id(followerId, followingId)) {
            throw new IllegalStateException("이미 팔로우 중인 사용자입니다.");
        }

        return followRepository.save(Follow.of(follower, following));
    }

    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        getUser(followerId);
        getUser(followingId);

        Follow follow = followRepository.findByFollower_IdAndFollowing_Id(followerId, followingId)
                .orElseThrow(() -> new IllegalArgumentException("팔로우 관계가 존재하지 않습니다."));

        followRepository.delete(follow);
    }

    @Transactional(readOnly = true)
    public Page<Follow> getFollowings(Long userId, Pageable pageable) {
        getUser(userId);
        return followRepository.findByFollower_Id(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Follow> getFollowers(Long userId, Pageable pageable) {
        getUser(userId);
        return followRepository.findByFollowing_Id(userId, pageable);
    }

    private void validateSelfFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다.");
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}
