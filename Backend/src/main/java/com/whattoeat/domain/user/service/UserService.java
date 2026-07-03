package com.whattoeat.domain.user.service;

import com.whattoeat.domain.follow.repository.FollowRepository;
import com.whattoeat.domain.user.dto.UpdateProfileRequest;
import com.whattoeat.domain.user.dto.UserProfileResponse;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.Role;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.AccessDeniedException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public UserProfileResponse getUser(Long targetId, Long currentUserId) {
        User user = userRepository.findById(targetId)
                .orElseThrow(() -> new UserNotFoundException(targetId));

        boolean isFollowing = followRepository
                .existsByFollower_IdAndFollowing_Id(currentUserId, targetId);
        return UserProfileResponse.from(user, currentUserId, isFollowing);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long id,Long currentUserId, UpdateProfileRequest request) {

        if (!id.equals(currentUserId)) {
            throw new AccessDeniedException("본인의 프로필만 수정 가능합니다.");
        }
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        user.updateProfile(request.nickname(), request.profileImage());
        return UserProfileResponse.from(user, currentUserId, false);
    }

    @Transactional
    public User kakaoLoginOrSignUp(String kakaoId, String nickname, String profileImg, String email) {
        return userRepository.findByKakaoId(kakaoId)
                .map(existingUser -> {
                    existingUser.updateProfile(nickname, profileImg);
                    return existingUser;
                })
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .kakaoId(kakaoId)
                                .nickname(nickname)
                                .profileImage(profileImg)
                                .email(email)
                                .provider(Provider.KAKAO)
                                .role(Role.USER)
                                .build()
                ));
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }

}
