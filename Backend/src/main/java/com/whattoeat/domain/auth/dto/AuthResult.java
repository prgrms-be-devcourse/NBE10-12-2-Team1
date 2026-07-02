package com.whattoeat.domain.auth.dto;

import com.whattoeat.domain.user.dto.UserProfileResponse;

public record AuthResult(
        String accessToken,
        String refreshToken,
        UserProfileResponse userProfile
) {
}
