package com.whattoeat.domain.feed.service;

import com.whattoeat.domain.feed.dto.request.FeedCreateRequest;
import com.whattoeat.domain.feed.dto.response.FeedDetailResponse;
import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

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

        FeedDetailResponse result = feedService.createFeed(user,feedCreateRequest);

        assertThat(result.content()).isEqualTo("맛집이네요");
    }
}
