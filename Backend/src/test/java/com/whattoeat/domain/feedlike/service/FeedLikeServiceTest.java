package com.whattoeat.domain.feedlike.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.feedlike.entity.FeedLike;
import com.whattoeat.domain.feedlike.repository.FeedLikeRepository;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.Role;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class FeedLikeServiceTest {

    @MockitoBean
    ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private FeedLikeService feedLikeService;

    @Autowired
    private FeedLikeRepository feedLikeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeedRepository feedRepository;

    @Test
    @DisplayName("like succeeds")
    void like() {
        User user = saveUser("user");
        Feed feed = saveFeed(user, "content");

        FeedLike feedLike = feedLikeService.like(user.getId(), feed.getId());

        assertThat(feedLike.getId()).isNotNull();
        assertThat(feedLike.getUser().getId()).isEqualTo(user.getId());
        assertThat(feedLike.getFeed().getId()).isEqualTo(feed.getId());
        assertThat(feedLikeRepository.existsByFeed_IdAndUser_Id(feed.getId(), user.getId()))
                .isTrue();
    }

    @Test
    @DisplayName("already liked feed fails")
    void likeAlreadyLikedFeed() {
        User user = saveUser("user");
        Feed feed = saveFeed(user, "content");
        feedLikeService.like(user.getId(), feed.getId());

        assertThatThrownBy(() -> feedLikeService.like(user.getId(), feed.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("이미 좋아요한 피드입니다.");
    }

    @Test
    @DisplayName("unlike succeeds")
    void unlike() {
        User user = saveUser("user");
        Feed feed = saveFeed(user, "content");
        feedLikeService.like(user.getId(), feed.getId());

        feedLikeService.unlike(user.getId(), feed.getId());

        assertThat(feedLikeRepository.existsByFeed_IdAndUser_Id(feed.getId(), user.getId()))
                .isFalse();
    }

    @Test
    @DisplayName("unlike fails when relation does not exist")
    void unlikeNotFound() {
        User user = saveUser("user");
        Feed feed = saveFeed(user, "content");

        assertThatThrownBy(() -> feedLikeService.unlike(user.getId(), feed.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("좋아요 관계가 존재하지 않습니다.");
    }

    @Test
    @DisplayName("is liked returns true")
    void isLikedTrue() {
        User user = saveUser("user");
        Feed feed = saveFeed(user, "content");
        feedLikeService.like(user.getId(), feed.getId());

        boolean liked = feedLikeService.isLiked(user.getId(), feed.getId());

        assertThat(liked).isTrue();
    }

    @Test
    @DisplayName("is liked returns false")
    void isLikedFalse() {
        User user = saveUser("user");
        Feed feed = saveFeed(user, "content");

        boolean liked = feedLikeService.isLiked(user.getId(), feed.getId());

        assertThat(liked).isFalse();
    }

    @Test
    @DisplayName("like fails when user does not exist")
    void likeUserNotFound() {
        User user = saveUser("user");
        Feed feed = saveFeed(user, "content");

        assertThatThrownBy(() -> feedLikeService.like(999L, feed.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("존재하지 않는 사용자입니다.");
    }

    @Test
    @DisplayName("like fails when feed does not exist")
    void likeFeedNotFound() {
        User user = saveUser("user");

        assertThatThrownBy(() -> feedLikeService.like(user.getId(), 999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("존재하지 않는 피드입니다.");
    }

    @Test
    @DisplayName("unlike fails when user does not exist")
    void unlikeUserNotFound() {
        User user = saveUser("user");
        Feed feed = saveFeed(user, "content");

        assertThatThrownBy(() -> feedLikeService.unlike(999L, feed.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("존재하지 않는 사용자입니다.");
    }

    @Test
    @DisplayName("unlike fails when feed does not exist")
    void unlikeFeedNotFound() {
        User user = saveUser("user");

        assertThatThrownBy(() -> feedLikeService.unlike(user.getId(), 999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("존재하지 않는 피드입니다.");
    }

    private User saveUser(String name) {
        return userRepository.save(User.builder()
                .loginId(name)
                .password("password")
                .kakaoId(name + "-kakao")
                .nickname(name)
                .email(name + "@test.com")
                .role(Role.USER)
                .provider(Provider.LOCAL)
                .build());
    }

    private Feed saveFeed(User user, String content) {
        Feed feed = Feed.builder()
                .user(user)
                .content(content)
                .build();
        ReflectionTestUtils.setField(feed, "updatedAt", LocalDateTime.now());
        return feedRepository.save(feed);
    }
}
