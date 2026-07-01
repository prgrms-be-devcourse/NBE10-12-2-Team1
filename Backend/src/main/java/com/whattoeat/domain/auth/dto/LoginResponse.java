package com.whattoeat.domain.auth.dto;

public record LoginResponse (
        String accessToken,
        String refreshToken,
        String nickname,
        String profileImage
)
{}
