package com.whattoeat.domain.feed.controller;

import com.whattoeat.domain.feed.dto.request.FeedCreateRequest;
import com.whattoeat.domain.feed.dto.request.FeedUpdateRequest;
import com.whattoeat.domain.feed.dto.response.FeedDetailResponse;
import com.whattoeat.domain.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.whattoeat.domain.feed.service.FeedService;
//import com.whattoeat.domain.user.service.UserService;

@RestController
@RequestMapping("/api/v1/feeds")
@RequiredArgsConstructor
public class FeedController {
    private final FeedService feedService;
//    private final UserService userService;

    @PostMapping
    public FeedDetailResponse createFeed(
            @Valid @RequestBody FeedCreateRequest feedCreateRequest){
        User user = User.builder()
                .nickname("dummy")
                .profileImage(null)
                .build(); // 더미 나중에 연결할때 제거
        return feedService.createFeed(user, feedCreateRequest);
    }

    @PutMapping("/{id}")
    public FeedDetailResponse updateFeed(
            @PathVariable Long id,
            @Valid @RequestBody FeedUpdateRequest feedUpdateRequest
    ){
        return feedService.updateFeed(id, feedUpdateRequest);
    }

    @DeleteMapping("/{id}")
    public void deleteFeed(@PathVariable Long id){
        feedService.deleteFeed(id);
    }

}
