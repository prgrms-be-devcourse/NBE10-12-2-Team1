package com.whattoeat.domain.feed.service;

import com.whattoeat.domain.feed.dto.request.FeedCreateRequest;
import com.whattoeat.domain.feed.dto.request.FeedUpdateRequest;
import com.whattoeat.domain.feed.dto.response.FeedDetailResponse;
import com.whattoeat.domain.feed.dto.response.FeedListResponse;
import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.follow.entity.Follow;
import com.whattoeat.domain.follow.repository.FollowRepository;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.global.exception.FeedNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@SpringBootTest
public class FeedServiceTest {
    @MockitoBean
    FeedRepository feedRepository;

    @MockitoBean
    RestaurantRepository restaurantRepository;

    @MockitoBean
    ClientRegistrationRepository clientRegistrationRepository;

    @MockitoBean
    FollowRepository followRepository;

    @Autowired
    FeedService feedService;

    private User createTestUser() {
        return User.builder()
                .nickname("test")
                .email("test@test.com")
                .provider(Provider.LOCAL)
                .build();

    }

    private User createTestUser(Long id, String nickname) {
        User user = User.builder()
                .nickname(nickname)
                .email("user" + id + "@test.com")
                .provider(Provider.LOCAL)
                .build();

        ReflectionTestUtils.setField(user, "id", id);

        return user;
    }

    private Feed createTestFeed(Long id, User user, String content) {
        Feed feed = Feed.builder()
                .user(user)
                .content(content)
                .build();

        ReflectionTestUtils.setField(feed, "id", id);

        return feed;
    }

    @Test
    @DisplayName("피드 생성 성공")
    public void createFeed_success() {
        User user = User.builder().nickname("test").build();
        FeedCreateRequest feedCreateRequest = new FeedCreateRequest("맛집이네요", null);

        Feed savedFeed = Feed.builder()
                .user(user)
                .content(feedCreateRequest.content())
                .build();

        given(feedRepository.save(any())).willReturn(savedFeed);

        FeedDetailResponse result = feedService.createFeed(user, feedCreateRequest);

        assertThat(result.content()).isEqualTo("맛집이네요");
    }

    @Test
    @DisplayName("피드 목록 조회 성공")
    public void getFeed_success() {
        User user = createTestUser();
        Feed feed1 = Feed.builder().user(user).content("맛집1").build();
        Feed feed2 = Feed.builder().user(user).content("맛집2").build();
        PageRequest pageable = PageRequest.of(0, 10);
        given(feedRepository.findAll(pageable))
                .willReturn(new PageImpl<>(List.of(feed1, feed2), pageable, 2));

        Page<FeedListResponse> result = feedService.getFeeds(null, null, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).content()).isEqualTo("맛집1");
    }

    @Test
    @DisplayName("피드 목록 조회 - 빈 결과")
    public void getFeed_empty() {
        PageRequest pageable = PageRequest.of(0, 10);
        given(feedRepository.findAll(pageable))
                .willReturn(new PageImpl<>(List.of(), pageable, 0));

        Page<FeedListResponse> result = feedService.getFeeds(null, null, pageable);
        assertThat(result.getContent().isEmpty());
        assertThat(result.getTotalElements()).isZero();
    }

    @Test
    @DisplayName("피드 수정 실패 - 존재하지 않는 필드")
    public void updateFeed_notFound() {
        FeedUpdateRequest req = new FeedUpdateRequest("수정된 내용", null);
        given(feedRepository.findById(999L)).willReturn(Optional.empty());
        assertThatThrownBy(() -> feedService.updateFeed(999L, req))
                .isInstanceOf(FeedNotFoundException.class)
                .hasMessageContaining("Feed not found");
    }

    @Test
    @DisplayName("피드 수정 성공")
    public void updateFeed_success() {
        User user = createTestUser();
        Feed feed = Feed.builder().user(user).content("원본 내용").build();
        FeedUpdateRequest request = new FeedUpdateRequest("수정된 내용", null);
        given(feedRepository.findById(1L)).willReturn(Optional.of(feed));
        given(feedRepository.save(any())).willReturn(feed);

        FeedDetailResponse result = feedService.updateFeed(1L, request);
        assertThat(result.content()).isEqualTo("수정된 내용");
    }

    @Test
    @DisplayName("피드 삭제 실패 - 존재하지 않는 필드")
    public void deleteFeed_notFound() {
        given(feedRepository.findById(999L)).willReturn(Optional.empty());
        assertThatThrownBy(() -> feedService.deleteFeed(999L))
                .isInstanceOf(FeedNotFoundException.class)
                .hasMessageContaining("Feed not found");
    }

    @Test
    @DisplayName("피드 삭제 성공")
    public void deleteFeed_success() {
        User user = createTestUser();
        Feed feed = Feed.builder().user(user).content("맛집이네요").build();
        given(feedRepository.findById(1L)).willReturn(Optional.of(feed));
        feedService.deleteFeed(1L);
        verify(feedRepository).delete(feed);
    }

    @Test
    @DisplayName("팔로잉한 사용자의 피드만 조회한다")
    void getFollowingFeeds() {
        User user1 = createTestUser(1L, "user1");
        User user2 = createTestUser(2L, "user2");
        User user3 = createTestUser(3L, "user3");

        Follow follow = Follow.of(user1, user2);

        Feed user2Feed = createTestFeed(10L, user2, "user2 feed");
        Feed user3Feed = createTestFeed(20L, user3, "user3 feed");

        PageRequest pageable = PageRequest.of(0, 10);

        given(followRepository.findByFollower_Id(1L, Pageable.unpaged()))
                .willReturn (new PageImpl<>(List.of(follow)));

        given(feedRepository.findByUser_IdIn(List.of(2L), pageable))
                .willReturn(new PageImpl<>(List.of(user2Feed), pageable, 1));

        Page<FeedListResponse> result = feedService.getFollowingFeeds(user1.getId(), pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent())
                .extracting(FeedListResponse::feedId)
                .contains(user2Feed.getId())
                .doesNotContain(user3Feed.getId());

        assertThat(result.getContent())
                .extracting(FeedListResponse::content)
                .contains("user2 feed")
                .doesNotContain("user3 feed");
    }

    @Test
    @DisplayName("내 피드와 팔로잉한 사용자의 피드를 제외하고 랜덤 추천 피드를 조회한다")
    void getRandomRecommendedFeeds() {
        User user1 = createTestUser(1L, "user1");
        User user2 = createTestUser(2L, "user2");
        User user3 = createTestUser(3L, "user3");

        Follow follow = Follow.of(user1, user2);

        Feed user1Feed = createTestFeed(10L, user1, "user1 feed");
        Feed user2Feed = createTestFeed(20L, user2, "user2 feed");
        Feed user3Feed = createTestFeed(30L, user3, "user3 feed");

        PageRequest pageable = PageRequest.of(0, 10);

        given(followRepository.findByFollower_Id(1L,Pageable.unpaged()))
                .willReturn(new PageImpl<>(List.of(follow)));

        given(feedRepository.findByUser_IdNotIn(List.of(1L, 2L)))
                .willReturn(List.of(user3Feed));

        Page<FeedListResponse> result = feedService.getRandomRecommendedFeeds(user1.getId(), pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent())
                .extracting(FeedListResponse::feedId)
                .contains(user3Feed.getId())
                .doesNotContain(user1Feed.getId(), user2Feed.getId());

        assertThat(result.getContent())
                .extracting(FeedListResponse::content)
                .contains("user3 feed")
                .doesNotContain("user1 feed", "user2 feed");
    }

}
