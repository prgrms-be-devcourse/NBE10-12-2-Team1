package com.whattoeat.global.security;

import com.whattoeat.domain.auth.service.AuthService;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.global.jwt.JwtUtil;
import com.whattoeat.global.rq.Rq;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final Rq rq;

    //application.yaml 파일에 app: fonrtend: url: 없으면 localhost:3000 동작
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        log.info("[OAuth2] onAuthenticationSuccess called");
        KakaoOAuth2User kakaoUser = (KakaoOAuth2User) authentication.getPrincipal();
        User user = kakaoUser.getUser();
        log.info("[OAuth2] authenticated user id={}", user.getId());

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        authService.saveRefreshToken(user.getId(), refreshToken);

        rq.setCookie("accessToken", accessToken, 60*60); // 1시간
        rq.setCookie("refreshToken", refreshToken, 60*60*24*7); // 7일
        log.info("[OAuth2] cookies set. userId={}", user.getId());

        String redirectUri = frontendUrl;
        String stateParam = request.getParameter("state");
        log.info("[OAuth2] stateParam={}", stateParam);

        if (stateParam != null && !stateParam.isBlank()) {
            // Base64 URL-safe 디코딩
            String decodeState = new String(
                    Base64.getUrlDecoder().decode(stateParam),
                    StandardCharsets.UTF_8
            );
            redirectUri = decodeState.split("#", 2)[0];
        }
        redirectUri = redirectUri + "/feed";
        log.info("[OAuth2] redirecting to {}", redirectUri);
        response.sendRedirect(redirectUri);
    }
}
