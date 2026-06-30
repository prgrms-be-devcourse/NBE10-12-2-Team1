package com.whattoeat.domain.auth.dto;

public record LoginResponse (
        String accessToken,
        String nickname,
        String profileImage
)
{}
