package com.whattoeat.domain.user.controller;

import com.whattoeat.domain.user.dto.UpdateProfileRequest;
import com.whattoeat.domain.user.dto.UserProfileResponse;
import com.whattoeat.domain.user.service.UserService;
import com.whattoeat.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    //프로필 조회
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUser(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getUser(id, userDetails.getUserId()));
    }

    //내 프로필 수정
    @PatchMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody @Valid UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, userDetails.getUserId(), request));
    }

}
