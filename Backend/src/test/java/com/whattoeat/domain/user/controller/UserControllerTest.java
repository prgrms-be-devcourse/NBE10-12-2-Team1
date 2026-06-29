package com.whattoeat.domain.user.controller;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.whattoeat.domain.user.dto.UpdateProfileRequest;
import com.whattoeat.domain.user.dto.UserProfileResponse;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.service.UserService;
import com.whattoeat.global.exception.UserNotFoundException;
import com.whattoeat.global.jwt.JwtUtil;
import com.whattoeat.global.security.CustomUserDetailsService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = UserController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private UserProfileResponse createResponse(Long id, String nickname, String profileImage) {
        return new UserProfileResponse(
                id, nickname, profileImage, "test@example.com", Provider.LOCAL, LocalDateTime.now());
    }

    @Test
    void getUser_성공() throws Exception {
        UserProfileResponse response = createResponse(1L, "testNickname", "profile.jpg");
        given(userService.getUser(1L)).willReturn(response);

        mockMvc.perform(get("/api/v1/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nickname").value("testNickname"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.provider").value("LOCAL"));
    }

    @Test
    void getUser_존재하지_않으면_404() throws Exception {
        given(userService.getUser(999L)).willThrow(new UserNotFoundException(999L));

        mockMvc.perform(get("/api/v1/users/999"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found: 999"));
    }

    @Test
    void updateProfile_성공() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest("newNickname", "new.jpg");
        UserProfileResponse response = createResponse(1L, "newNickname", "new.jpg");
        given(userService.updateProfile(1L, request)).willReturn(response);

        mockMvc.perform(patch("/api/v1/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("newNickname"))
                .andExpect(jsonPath("$.profileImage").value("new.jpg"));
    }

    @Test
    void updateProfile_존재하지_않으면_404() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest("nickname", null);
        given(userService.updateProfile(999L, request)).willThrow(new UserNotFoundException(999L));

        mockMvc.perform(patch("/api/v1/users/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateProfile_닉네임이_blank이면_400() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest("", "image.jpg");

        mockMvc.perform(patch("/api/v1/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("nickname")));
    }

    @Test
    void updateProfile_닉네임이_20자_초과이면_400() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest("a".repeat(21), "image.jpg");

        mockMvc.perform(patch("/api/v1/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("nickname")));
    }
}
