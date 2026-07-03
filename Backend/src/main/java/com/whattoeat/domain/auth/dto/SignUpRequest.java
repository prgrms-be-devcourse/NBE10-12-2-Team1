package com.whattoeat.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignUpRequest (
    @NotBlank @Email @Size(min = 4, max =20) String loginId,
    @NotBlank @Size(min = 4, max =20) String password,
    @NotBlank @Size(min =4 ,max =20) String passwordConfirm,
    @NotBlank @Size(max =20) String nickname
)
{}
