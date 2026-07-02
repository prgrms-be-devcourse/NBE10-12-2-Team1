package com.whattoeat.global.security;

import com.whattoeat.domain.auth.service.AuthService;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.global.jwt.JwtUtil;
import com.whattoeat.global.rq.Rq;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;

import java.lang.reflect.Field;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
public class CustomOAuth2LoginSuccessHandlerTest {
    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthService authService;

    @Mock
    private Rq rq;

    @Mock
    private User user;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CustomOAuth2LoginSuccessHandler handler;

    private MockHttpServletRequest req;
    private MockHttpServletResponse res;

    @BeforeEach
    void setUp() throws Exception {
        Field field = CustomOAuth2LoginSuccessHandler.class.getDeclaredField("frontendUrl");
        field.setAccessible(true);
        field.set(handler, "http://localhost:3000");

        req = new MockHttpServletRequest();
        res = new MockHttpServletResponse();

        KakaoOAuth2User principal = new KakaoOAuth2User(user);
        given(authentication.getPrincipal()).willReturn(principal);
        given(jwtUtil.generateAccessToken(user)).willReturn("access-token");
        given(jwtUtil.generateRefreshToken(user)).willReturn("refresh-token");

    }

    @Test
    @DisplayName("로그인 성공")
    void success() throws Exception {
        handler.onAuthenticationSuccess(req, res, authentication);

        then(authService).should().saveRefreshToken(user.getId(), "refresh-token");
        then(rq).should().setCookie("accessToken", "access-token", 60 * 60);
        then(rq).should().setCookie("refreshToken", "refresh-token", 60 * 60 * 24 * 7);
        assertThat(res.getRedirectedUrl()).isEqualTo("http://localhost:3000");
    }

    @Test
    @DisplayName("state로 redirectUri 복원")
    void state_redirect_uri() throws Exception {
        String state = Base64.getUrlEncoder().encodeToString(
                ("http://localhost:3000/mypage#uuid").getBytes()
        );
        req.setParameter("state", state);
        handler.onAuthenticationSuccess(req, res, authentication);
        assertThat(res.getRedirectedUrl()).isEqualTo("http://localhost:3000/mypage");
    }
}
