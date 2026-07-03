package com.whattoeat.domain.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.whattoeat.domain.follow.repository.FollowRepository;
import com.whattoeat.domain.user.dto.UpdateProfileRequest;
import com.whattoeat.domain.user.dto.UserProfileResponse;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.Role;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.UserNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowRepository followRepository;

    @InjectMocks
    private UserService userService;

    private User createUser(Long id, String nickname, String profileImage) {
        User user = User.builder()
                .nickname(nickname)
                .email("test@example.com")
                .provider(Provider.LOCAL)
                .role(Role.USER)
                .profileImage(profileImage)
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    // ===================== getUser 테스트 =====================

    @Test
    void getUser_본인_프로필_조회시_isOwnProfile이_true() {
        User user = createUser(1L, "testNickname", "profile.jpg");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(followRepository.existsByFollower_IdAndFollowing_Id(1L, 1L)).willReturn(false);

        UserProfileResponse response = userService.getUser(1L, 1L);

        assertThat(response.isOwnProfile()).isTrue();
        assertThat(response.isFollowing()).isFalse();
        assertThat(response.nickname()).isEqualTo("testNickname");
    }

    @Test
    void getUser_타인_프로필_조회시_팔로우_중이면_isFollowing이_true() {
        User user = createUser(2L, "otherNickname", "other.jpg");
        given(userRepository.findById(2L)).willReturn(Optional.of(user));
        given(followRepository.existsByFollower_IdAndFollowing_Id(1L, 2L)).willReturn(true);

        UserProfileResponse response = userService.getUser(2L, 1L);

        assertThat(response.isOwnProfile()).isFalse();
        assertThat(response.isFollowing()).isTrue();
    }

    @Test
    void getUser_타인_프로필_조회시_팔로우_안하면_isFollowing이_false() {
        User user = createUser(2L, "otherNickname", "other.jpg");
        given(userRepository.findById(2L)).willReturn(Optional.of(user));
        given(followRepository.existsByFollower_IdAndFollowing_Id(1L, 2L)).willReturn(false);

        UserProfileResponse response = userService.getUser(2L, 1L);

        assertThat(response.isOwnProfile()).isFalse();
        assertThat(response.isFollowing()).isFalse();
    }

    @Test
    void getUser_존재하지_않는_유저이면_예외발생() {
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUser(999L, 1L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("999");
    }

    // ===================== updateProfile 테스트 =====================

    @Test
    void updateProfile_닉네임과_이미지를_변경한다() {
        User user = createUser(1L, "oldNickname", "old.jpg");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        UpdateProfileRequest request = new UpdateProfileRequest("newNickname", "new.jpg");

        UserProfileResponse response = userService.updateProfile(1L, 1L, request);

        assertThat(response.nickname()).isEqualTo("newNickname");
        assertThat(response.profileImage()).isEqualTo("new.jpg");
    }

    @Test
    void updateProfile_이미지가_null이면_기존_이미지를_유지한다() {
        User user = createUser(1L, "nickname", "existing.jpg");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        UpdateProfileRequest request = new UpdateProfileRequest("newNickname", null);

        UserProfileResponse response = userService.updateProfile(1L, 1L, request);

        assertThat(response.nickname()).isEqualTo("newNickname");
        assertThat(response.profileImage()).isEqualTo("existing.jpg");
    }

    @Test
    void updateProfile_타인_프로필_수정시_AccessDeniedException_발생() {
        UpdateProfileRequest request = new UpdateProfileRequest("nickname", null);

        assertThatThrownBy(() -> userService.updateProfile(2L, 1L, request))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void updateProfile_존재하지_않는_유저이면_예외발생() {
        given(userRepository.findById(999L)).willReturn(Optional.empty());
        UpdateProfileRequest request = new UpdateProfileRequest("nickname", null);

        assertThatThrownBy(() -> userService.updateProfile(999L, 999L, request))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("999");
    }
}
