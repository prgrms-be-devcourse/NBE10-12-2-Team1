package com.whattoeat.domain.user.dto;

import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.User;
import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String nickname,
        String profileImage,
        String email,
        Provider provider,
        LocalDateTime createdAt) {

    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getNickname(),
                user.getProfileImage(),
                user.getEmail(),
                user.getProvider(),
                user.getCreatedAt());
    }
}
