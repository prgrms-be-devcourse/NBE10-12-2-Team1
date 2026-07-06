package com.whattoeat.domain.user.controller;

import com.whattoeat.domain.user.dto.UpdateProfileRequest;
import com.whattoeat.domain.user.dto.UserProfileResponse;
import com.whattoeat.domain.user.service.UserService;
import com.whattoeat.global.rsData.RsData;
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

    //내 프로필 조회
    @GetMapping("/me")
    public ResponseEntity<RsData<UserProfileResponse>> getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(RsData.success(userService.getUser(userDetails.getUserId(), userDetails.getUserId()), "내 프로필 조회 성공"));
    }

    //프로필 조회
    @GetMapping("/{id}")
    public ResponseEntity<RsData<UserProfileResponse>> getUser(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(RsData.success(userService.getUser(id, userDetails.getUserId()), "프로필 조회 성공"));
    }

    //내 프로필 수정
    @PatchMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody @Valid UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, userDetails.getUserId(), request));
    }

}
