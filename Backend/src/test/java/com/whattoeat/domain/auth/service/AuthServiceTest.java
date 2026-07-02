package com.whattoeat.domain.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.whattoeat.domain.auth.dto.*;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.Role;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.DuplicateLoginIdException;
import com.whattoeat.global.exception.DuplicateNicknameException;
import com.whattoeat.global.exception.InvalidCredentialsException;
import com.whattoeat.global.exception.PasswordMismatchException;
import com.whattoeat.global.jwt.JwtUtil;
import java.util.Optional;


import io.jsonwebtoken.JwtException;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AuthService authService;

    private SignUpRequest signUpRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        signUpRequest = new SignUpRequest("testuser", "pass1234", "pass1234", "testnick", "test@test.com");
        loginRequest = new LoginRequest("testuser", "pass1234");
        user = User.builder()
                .loginId("testuser")
                .password("encodedPassword")
                .nickname("testnick")
                .email("test@test.com")
                .provider(Provider.LOCAL)
                .role(Role.USER)
                .build();
    }

    // ========== signup ==========

    @Test
    @DisplayName("정상 입력으로 회원가입 성공")
    void signupSuccess() {
        given(userRepository.existsByLoginId("testuser")).willReturn(false);
        given(userRepository.existsByNickname("testnick")).willReturn(false);

        assertThatNoException().isThrownBy(() -> authService.signup(signUpRequest));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("아이디 중복 시 DuplicateLoginIdException 발생")
    void signupFailDuplicateLoginId() {
        given(userRepository.existsByLoginId("testuser")).willReturn(true);

        assertThatThrownBy(() -> authService.signup(signUpRequest))
                .isInstanceOf(DuplicateLoginIdException.class)
                .hasMessageContaining("아이디");
    }

    @Test
    @DisplayName("닉네임 중복 시 DuplicateNicknameException 발생")
    void signupFailDuplicateNickname() {
        given(userRepository.existsByLoginId("testuser")).willReturn(false);
        given(userRepository.existsByNickname("testnick")).willReturn(true);

        assertThatThrownBy(() -> authService.signup(signUpRequest))
                .isInstanceOf(DuplicateNicknameException.class)
                .hasMessageContaining("닉네임");
    }

    @Test
    @DisplayName("비밀번호 확인 불일치 시 PasswordMismatchException 발생")
    void signupFailPasswordMismatch() {
        SignUpRequest mismatchRequest = new SignUpRequest("testuser", "pass1234", "different", "testnick", "test@test.com");

        assertThatThrownBy(() -> authService.signup(mismatchRequest))
                .isInstanceOf(PasswordMismatchException.class)
                .hasMessageContaining("비밀번호");
    }

    // ========== login ==========

    @Test
    @DisplayName("정상 아이디/비밀번호로 로그인 성공 후 토큰 반환")
    void loginSuccess() {
        given(userRepository.findByLoginId("testuser")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("pass1234", "encodedPassword")).willReturn(true);
        given(jwtUtil.generateAccessToken(user)).willReturn("mocked-access-token");
        given(jwtUtil.generateRefreshToken(user)).willReturn("mocked-refresh-token");

        given(redisTemplate.opsForValue()).willReturn(mock(ValueOperations.class));

        AuthResult result = authService.login(loginRequest);

        assertThat(result.accessToken()).isEqualTo("mocked-access-token");
        assertThat(result.refreshToken()).isEqualTo("mocked-refresh-token");
        assertThat(result.nickname()).isEqualTo("testnick");
    }

    @Test
    @DisplayName("존재하지 않는 아이디로 로그인 시 InvalidCredentialsException 발생")
    void loginFailUserNotFound() {
        given(userRepository.findByLoginId("testuser")).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    @DisplayName("비밀번호 불일치 시 InvalidCredentialsException 발생")
    void loginFailWrongPassword() {
        given(userRepository.findByLoginId("testuser")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("pass1234", "encodedPassword")).willReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    @DisplayName("refreshToken으로 새 accessToken 발급")
    void refreshTokenSuccess() {
        String refreshToken = "mocked-refresh-token";
        String newAccessToken = "mocked-access-token";

        given(jwtUtil.getUserId(refreshToken)).willReturn(1L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("refresh:1")).willReturn(refreshToken);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(jwtUtil.generateAccessToken(user)).willReturn(newAccessToken);

        TokenResponse response = authService.reissue(refreshToken);

        assertThat(response.accessToken()).isEqualTo(newAccessToken);
    }

    @Test
    @DisplayName("refreshToken으로 accessToken+refreshToken 재발급")
    void refreshSuccess() {
        String oldrefreshToken = "valid-refresh-token";
        String newAccessToken = "new-access-token";
        String newRefreshToken = "new-refresh-token";

        given(jwtUtil.getUserId(oldrefreshToken)).willReturn(1L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("refresh:1")).willReturn(oldrefreshToken);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(jwtUtil.generateAccessToken(user)).willReturn(newAccessToken);
        given(jwtUtil.generateRefreshToken(user)).willReturn(newRefreshToken);

        TokenResponse response = authService.reissue(oldrefreshToken);

        assertThat(response.accessToken()).isEqualTo(newAccessToken);
        assertThat(response.refreshToken()).isEqualTo(newRefreshToken);
    }

    @Test
    @DisplayName("Redis 저장된 refreshToken 없을 때 예외 발생")
    void refreshFailNotFound() {
        String refreshToken = "unknown-refresh-token";
        given(jwtUtil.getUserId(refreshToken)).willReturn(1L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("refresh:1")).willReturn(null);

        assertThatThrownBy(() -> authService.reissue(refreshToken))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("refreshToken");
    }

    @Test
    @DisplayName("저장된 refreshToken, 요청받은 refreshToken 다를 시 예외 발생")
    void refreshMismatch() {
        String refreshToken = "my-refresh-token";
        String storedRefreshToken = "different-token";

        given(jwtUtil.getUserId(refreshToken)).willReturn(1L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("refresh:1")).willReturn(storedRefreshToken);

        assertThatThrownBy(() -> authService.reissue(refreshToken))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("refreshToken");
    }

    @Test
    @DisplayName("위변조된 refreshToken일 시 JwtException 발생")
    void refreshFailJwtException() {
        String invalidToken = "fake.jwt.token";
        given(jwtUtil.getUserId(invalidToken)).willThrow(new JwtException("위변조된 토큰입니다."));
        assertThatThrownBy(() -> authService.reissue(invalidToken))
                .isInstanceOf(JwtException.class);
    }
    // ========== logout ==========

    @Test
    @DisplayName("로그아웃 시 Redis 블랙리스트에 토큰 저장")
    void logoutSuccess() {
        String token = "valid.jwt.token";
        long remaining = 3600000L;

        given(jwtUtil.getRemainingExpiration(token)).willReturn(remaining);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);

        authService.logout(token);

        verify(valueOperations, times(1))
                .set("blacklist:" + token, "logout", remaining, TimeUnit.MILLISECONDS);
    }

    @Test
    @DisplayName("만료된 토큰으로 로그아웃 시 Redis에 저장하지 않음")
    void logoutWithExpiredToken() {
        String token = "expired.jwt.token";

        given(jwtUtil.getRemainingExpiration(token)).willReturn(-1L);

        authService.logout(token);

        verify(redisTemplate, never()).opsForValue();
    }
}
