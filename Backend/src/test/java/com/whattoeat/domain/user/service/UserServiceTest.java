package com.whattoeat.domain.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.whattoeat.domain.user.dto.UpdateProfileRequest;
import com.whattoeat.domain.user.dto.UserProfileResponse;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.UserNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User createUser(String nickname, String profileImage) {
        return User.builder()
                .loginId("testuser")
                .password("password")
                .nickname(nickname)
                .email("test@example.com")
                .provider(Provider.LOCAL)
                .profileImage(profileImage)
                .build();
    }

    @Test
    void getUser_성공() {
        User user = createUser("testNickname", "profile.jpg");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        UserProfileResponse response = userService.getUser(1L);

        assertThat(response.nickname()).isEqualTo("testNickname");
        assertThat(response.email()).isEqualTo("test@example.com");
        assertThat(response.profileImage()).isEqualTo("profile.jpg");
        assertThat(response.provider()).isEqualTo(Provider.LOCAL);
    }

    @Test
    void getUser_존재하지_않는_유저이면_예외발생() {
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUser(999L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void updateProfile_닉네임과_이미지를_변경한다() {
        User user = createUser("oldNickname", "old.jpg");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        UpdateProfileRequest request = new UpdateProfileRequest("newNickname", "new.jpg");

        UserProfileResponse response = userService.updateProfile(1L, request);

        assertThat(response.nickname()).isEqualTo("newNickname");
        assertThat(response.profileImage()).isEqualTo("new.jpg");
    }

    @Test
    void updateProfile_이미지가_null이면_기존_이미지를_유지한다() {
        User user = createUser("nickname", "existing.jpg");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        UpdateProfileRequest request = new UpdateProfileRequest("newNickname", null);

        UserProfileResponse response = userService.updateProfile(1L, request);

        assertThat(response.nickname()).isEqualTo("newNickname");
        assertThat(response.profileImage()).isEqualTo("existing.jpg");
    }

    @Test
    void updateProfile_존재하지_않는_유저이면_예외발생() {
        given(userRepository.findById(999L)).willReturn(Optional.empty());
        UpdateProfileRequest request = new UpdateProfileRequest("nickname", null);

        assertThatThrownBy(() -> userService.updateProfile(999L, request))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("999");
    }
}
