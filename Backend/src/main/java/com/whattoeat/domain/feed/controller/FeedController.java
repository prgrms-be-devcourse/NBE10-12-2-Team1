package com.whattoeat.domain.feed.controller;

import com.whattoeat.domain.feed.dto.request.FeedCreateRequest;
import com.whattoeat.domain.feed.dto.response.FeedDetailResponse;
import com.whattoeat.domain.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.whattoeat.domain.feed.service.FeedService;
import com.whattoeat.global.response.RsData;
import com.whattoeat.domain.user.service.UserService;

@RestController
@RequestMapping("/api/v1/feeds")
@RequiredArgsConstructor
public class FeedController {
    private final FeedService feedService;
    private final UserService userService;

    @PostMapping
    public RsData<FeedDetailResponse> createFeed(
            @Valid @RequestBody FeedCreateRequest feedCreateRequest){
        User user = userService.findById(1L).orElseThrow();
        FeedDetailResponse feedDetailResponse = feedService.createFeed(user, feedCreateRequest);
        return RsData.of(feedDetailResponse);
    }
}
