package com.whattoeat.domain.feed.controller;

import com.whattoeat.domain.feed.dto.response.FeedListPageResponse;
import com.whattoeat.domain.feed.dto.request.FeedCreateRequest;
import com.whattoeat.domain.feed.dto.request.FeedUpdateRequest;
import com.whattoeat.domain.feed.dto.response.FeedDetailResponse;
import com.whattoeat.domain.feed.dto.response.FeedListResponse;
import com.whattoeat.global.rsData.RsData;
import com.whattoeat.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.whattoeat.domain.feed.service.FeedService;

@RestController
@RequestMapping("/api/v1/feeds")
@RequiredArgsConstructor
public class FeedController {
    private final FeedService feedService;

    @PostMapping
    public RsData<FeedDetailResponse> createFeed(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody FeedCreateRequest feedCreateRequest) {
        FeedDetailResponse response = feedService.createFeed(userDetails.getUser(), feedCreateRequest);
        return RsData.success(response, "피드가 생성되었습니다.");
    }

    @GetMapping
    public RsData<FeedListPageResponse> getFeeds(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long restaurantId,
            Pageable pageable
    ) {
        Page<FeedListResponse> page = feedService.getFeeds(userId, restaurantId, pageable);
        return RsData.success(FeedListPageResponse.from(page), "피드 목록 조회가 완료되었습니다.");
    }

    @GetMapping("/following")
    public RsData<FeedListPageResponse> getFollowingFeeds(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable
    ) {
        Page<FeedListResponse> page = feedService.getFollowingFeeds(userDetails.getUserId(), pageable);
        return RsData.success(FeedListPageResponse.from(page), "팔로잉 피드 조회가 완료되었습니다.");
    }

    @GetMapping("/recommend")
    public RsData<FeedListPageResponse> getRecommendedFeeds(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable
    ) {
        Page<FeedListResponse> page = feedService.getRandomRecommendedFeeds(userDetails.getUserId(), pageable);
        return RsData.success(FeedListPageResponse.from(page), "추천 피드 조회가 완료되었습니다.");
    }

    @PutMapping("/{id}")
    public RsData<FeedDetailResponse> updateFeed(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody FeedUpdateRequest feedUpdateRequest
    ) {
        FeedDetailResponse response = feedService.updateFeed(id, userDetails.getUserId(), feedUpdateRequest);
        return RsData.success(response, "피드가 수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public RsData<Void> deleteFeed(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        feedService.deleteFeed(id, userDetails.getUserId());
        return RsData.success(null, "피드가 삭제되었습니다.");
    }

}
