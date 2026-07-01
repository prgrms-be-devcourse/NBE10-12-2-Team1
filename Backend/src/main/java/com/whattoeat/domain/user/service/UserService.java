package com.whattoeat.domain.user.service;

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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserProfileResponse getUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        user.updateProfile(request.nickname(), request.profileImage());
        return UserProfileResponse.from(user);
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

}
