package com.whattoeat.domain.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.whattoeat.domain.auth.dto.LoginRequest;
import com.whattoeat.domain.auth.dto.LoginResponse;
import com.whattoeat.domain.auth.dto.SignUpRequest;
import com.whattoeat.domain.auth.service.AuthService;
import com.whattoeat.global.exception.DuplicateLoginIdException;
import com.whattoeat.global.exception.DuplicateNicknameException;
import com.whattoeat.global.exception.InvalidCredentialsException;
import com.whattoeat.global.jwt.JwtUtil;
import com.whattoeat.global.security.CustomUserDetailsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = AuthController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    // ========== POST /api/v1/auth/signup ==========

    @Test
    @DisplayName("정상 입력으로 회원가입 성공 시 200 반환")
    void signupSuccess() throws Exception {
        SignUpRequest request = new SignUpRequest("testuser", "pass1234", "pass1234", "testnick", "test@test.com");
        willDoNothing().given(authService).signup(any());

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("회원가입이 완료되었습니다."));
    }

    @Test
    @DisplayName("아이디 중복 시 409 반환")
    void signupFailDuplicateLoginId() throws Exception {
        SignUpRequest request = new SignUpRequest("testuser", "pass1234", "pass1234", "testnick", "test@test.com");
        willThrow(new DuplicateLoginIdException("이미 사용 중인 아이디입니다.")).given(authService).signup(any());

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("이미 사용 중인 아이디입니다."));
    }

    @Test
    @DisplayName("닉네임 중복 시 409 반환")
    void signupFailDuplicateNickname() throws Exception {
        SignUpRequest request = new SignUpRequest("testuser", "pass1234", "pass1234", "testnick", "test@test.com");
        willThrow(new DuplicateNicknameException("이미 사용 중인 닉네임입니다.")).given(authService).signup(any());

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("이미 사용 중인 닉네임입니다."));
    }

    @Test
    @DisplayName("아이디 빈 값으로 회원가입 시 400 반환")
    void signupFailBlankLoginId() throws Exception {
        SignUpRequest request = new SignUpRequest("", "pass1234", "pass1234", "testnick", "test@test.com");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("loginId")));
    }

    @Test
    @DisplayName("비밀번호 4자 미만으로 회원가입 시 400 반환")
    void signupFailShortPassword() throws Exception {
        SignUpRequest request = new SignUpRequest("testuser", "abc", "abc", "testnick", "test@test.com");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("password")));
    }

    @Test
    @DisplayName("이메일 형식이 아닌 값으로 회원가입 시 400 반환")
    void signupFailInvalidEmail() throws Exception {
        SignUpRequest request = new SignUpRequest("testuser", "pass1234", "pass1234", "testnick", "invalid-email");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("email")));
    }

    // ========== POST /api/v1/auth/login ==========

    @Test
    @DisplayName("정상 아이디/비밀번호로 로그인 성공 시 200과 토큰 반환")
    void loginSuccess() throws Exception {
        LoginRequest request = new LoginRequest("testuser", "pass1234");
        LoginResponse response = new LoginResponse("mocked-access-token", "mocked-refresh-token","testnick", null);
        given(authService.login(any())).willReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mocked-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("mocked-refresh-token"))
                .andExpect(jsonPath("$.data.nickname").value("testnick"))
                .andExpect(jsonPath("$.message").value("로그인 성공"));
    }

    @Test
    @DisplayName("아이디 또는 비밀번호 불일치 시 401 반환")
    void loginFailInvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("testuser", "wrongpass");
        given(authService.login(any())).willThrow(new InvalidCredentialsException("아이디/비밀번호가 올바르지 않습니다."));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("아이디/비밀번호가 올바르지 않습니다."));
    }

    @Test
    @DisplayName("아이디 빈 값으로 로그인 시 400 반환")
    void loginFailBlankLoginId() throws Exception {
        LoginRequest request = new LoginRequest("", "pass1234");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("loginId")));
    }
}
