package com.whattoeat.global.security;

import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.Role;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
public class CustomOAuth2LoginSuccessHandlerTest {
    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private Rq rq;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CustomOAuth2LoginSuccessHandler handler;

    @BeforeEach
    void setUp() throws Exception {
        Field field = CustomOAuth2LoginSuccessHandler.class.getDeclaredField("frontendUrl");
        field.setAccessible(true);
        field.set(handler, "http://localhost:3000");
    }

    @Test
    @DisplayName("로그인 성공")
    void success() throws Exception{
        User user = User.builder()
                .kakaoId("123456789")
                .nickname("nickname")
                .email("test@test.com")
                .provider(Provider.KAKAO)
                .role(Role.USER)
                .build();

        KakaoOAuth2User principal = new KakaoOAuth2User(user);
        given(authentication.getPrincipal()).willReturn(principal);
        given(jwtUtil.generateToken(user)).willReturn("token-value");

        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(req,res,authentication);

        then(rq).should().setCookie("accessToken","token-value");
        assertThat(res.getRedirectedUrl()).isEqualTo("http://localhost:3000");
    }
}
