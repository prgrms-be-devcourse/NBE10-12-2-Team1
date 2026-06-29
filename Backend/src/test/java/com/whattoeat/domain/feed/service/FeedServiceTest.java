package com.whattoeat.domain.feed.service;

import com.whattoeat.domain.feed.dto.request.FeedCreateRequest;
import com.whattoeat.domain.feed.dto.request.FeedUpdateRequest;
import com.whattoeat.domain.feed.dto.response.FeedDetailResponse;
import com.whattoeat.domain.feed.dto.response.FeedListResponse;
import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;


import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@SpringBootTest
public class FeedServiceTest {
    @MockitoBean
    FeedRepository feedRepository;

    @MockitoBean
    RestaurantRepository restaurantRepository;

    @Autowired
    FeedService feedService;

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
        User user = User.builder().nickname("test").build();
        Feed feed1 = Feed.builder().user(user).content("맛집1").build();
        Feed feed2 = Feed.builder().user(user).content("맛집2").build();
        PageRequest pageable = PageRequest.of(0, 10);
        given(feedRepository.findAll(pageable))
                .willReturn(new PageImpl<>(List.of(feed1, feed2), pageable, 2));

        Page<FeedListResponse> restlt = feedService.getFeeds(null, null, pageable);

        assertThat(restlt.getContent()).hasSize(2);
        assertThat(restlt.getContent().get(0).content()).isEqualTo("맛집1");
    }

    @Test
    @DisplayName("피드 목록 조회 - 빈 결과")
    public void getFeed_empty() {
        PageRequest pageable = PageRequest.of(0, 10);
        given(feedRepository.findAll(pageable))
                .willReturn(Page.empty(pageable));

        Page<FeedListResponse> restlt = feedService.getFeeds(null, null, pageable);
        assertThat(restlt.getContent().isEmpty());
        assertThat(restlt.getTotalElements()).isZero();
    }

    @Test
    @DisplayName("피드 수정 실패 - 존재하지 않는 필드")
    public void updateFeed_notFound() {
        FeedUpdateRequest req = new FeedUpdateRequest("수정된 내용",null);
        given(feedRepository.findById(999L)).willReturn(Optional.empty());
        assertThatThrownBy(() -> feedService.updateFeed(999L,req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("피드를 찾을 수 없습니다.");

    }

    @Test
    @DisplayName("피드 수정 성공")
    public void updateFeed_success() {
        PageRequest pageable = PageRequest.of(0, 10);
    }

}
