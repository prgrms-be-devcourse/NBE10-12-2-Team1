package com.whattoeat.global.security;

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

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@RequiredArgsConstructor
public class CustomOAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final JwtUtil jwtUtil;
    private final Rq rq;

    //application.yaml 파일에 app: fonrtend: url: 없으면 localhost:3000 동작
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        KakaoOAuth2User kakaoUser = (KakaoOAuth2User) authentication.getPrincipal();
        User user = kakaoUser.getUser();

        String accessToken = jwtUtil.generateAccessToken(user);
        rq.setCookie("accessToken", accessToken);

        String redirectUri = frontendUrl;

        String stateParam = request.getParameter("state");
        if (stateParam != null && !stateParam.isBlank()) {
            // Base64 URL-safe 디코딩
            String decodeState = new String(
                    Base64.getUrlDecoder().decode(stateParam),
                    StandardCharsets.UTF_8
            );

            redirectUri = decodeState.split("#", 2)[0];
        }
        response.sendRedirect(redirectUri);
    }
}
