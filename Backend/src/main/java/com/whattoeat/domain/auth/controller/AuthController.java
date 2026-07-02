package com.whattoeat.domain.auth.controller;

import com.whattoeat.domain.auth.dto.LoginRequest;
import com.whattoeat.domain.auth.dto.LoginResponse;
import com.whattoeat.domain.auth.dto.SignUpRequest;
import com.whattoeat.domain.auth.dto.TokenResponse;
import com.whattoeat.domain.auth.service.AuthService;
import com.whattoeat.global.exception.InvalidCredentialsException;
import com.whattoeat.global.rq.Rq;
import com.whattoeat.global.rsData.RsData;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final Rq rq;

    @PostMapping("/signup")
    public ResponseEntity<RsData<Void>> signup(@Valid @RequestBody SignUpRequest request) {
        authService.signup(request);
        return ResponseEntity.ok(RsData.success(null, "회원가입이 완료되었습니다."));
    }

    @PostMapping("/login")
    public ResponseEntity<RsData<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        rq.setCookie("accessToken", response.accessToken(), 60 * 60);
        rq.setCookie("refreshToken", response.refreshToken(), 60 * 60 * 24 * 7);

        return ResponseEntity.ok(RsData.success(response, "로그인 성공"));
    }

    @PostMapping("/reissue")
    public ResponseEntity<RsData<TokenResponse>> reissue() {
        String refreshToken = rq.getCookieValue("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidCredentialsException("Refresh Token이 필요합니다.");
        }
        TokenResponse response = authService.reissue(refreshToken);

        rq.setCookie("accessToken", response.accessToken(), 60 * 60);
        rq.setCookie("refreshToken", response.refreshToken(), 60 * 60 * 24 * 7);

        return ResponseEntity.ok(RsData.success(null, "토큰이 갱신되었습니다."));
    }
    @PostMapping("/logout")
    public RsData<Void> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
        }
        return RsData.success(null, "로그아웃 되었습니다.");
    }
}
