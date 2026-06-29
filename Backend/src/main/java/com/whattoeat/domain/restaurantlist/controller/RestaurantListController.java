package com.whattoeat.domain.restaurantlist.controller;

import com.whattoeat.domain.restaurantlist.dto.RestaurantListRequest;
import com.whattoeat.domain.restaurantlist.dto.RestaurantListResponse;
import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;
import com.whattoeat.domain.restaurantlist.service.RestaurantListService;
import com.whattoeat.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lists")
@RequiredArgsConstructor
public class RestaurantListController {
    private final RestaurantListService restaurantListService;

    // 맛집 리스트 등록
    @PostMapping
    public RsData<RestaurantListResponse.RestaurantLists> createRestaurantList(
            @RequestBody RestaurantListRequest.RestaurantList req
    ) {
        // 임시로 1로 지정 로그인 붙으면 사용자 id로 변경 예정
        Long userId = 1L;

        RestaurantList restaurantList = restaurantListService.create(
                userId,
                req.title(),
                req.description(),
                req.moodTag()
        );

        return RsData.success(
                new RestaurantListResponse.RestaurantLists(restaurantList),
                "맛집 리스트가 생성되었습니다."
        );
    }

    // 맛집 리스트 다건 조회
    @GetMapping
    @Operation(summary = "맛집 리스트 다건 조회")
    public RsData<List<RestaurantListResponse.RestaurantLists>> getRestaurantLists() {
        // 임시로 1로 지정 로그인 붙으면 사용자 id로 변경 예정
        Long userId = 1L;

        List<RestaurantListResponse.RestaurantLists> restaurantLists = restaurantListService.findAllByUserId(userId)
                .stream()
                .map(RestaurantListResponse.RestaurantLists::new)
                .toList();

        return RsData.success(
                restaurantLists,
                "맛집 리스트 목록 조회가 완료되었습니다."
        );
    }

    // 맛집 리스트 단건 조회
    @GetMapping("/{id}")
    @Operation(summary = "맛집 리스트 단건 조회")
    public RsData<RestaurantListResponse.RestaurantListDetail> getRestaurantList(@PathVariable Long id) {
        // 임시로 1로 지정 로그인 붙으면 사용자 id로 변경 예정
        Long userId = 1L;

        RestaurantList restaurantList = restaurantListService.findByIdAndUserId(id, userId);

        return RsData.success(
                new RestaurantListResponse.RestaurantListDetail(restaurantList),
        "맛집 리스트 조회가 완료되었습니다."
        );
    }


    // ----------- RestaurantListItem -------------

    // 맛집 리스트 아이템 등록
    @PostMapping("/{id}/Items")
    @Operation(summary = "맛집 리스트 아이템 등록")
    public RsData<RestaurantListResponse.RestaurantListItemRes> createRestaurantListItem(
            @PathVariable("id") Long listId,
            @RequestBody RestaurantListRequest.RestaurantListItem req
    ) {
        // 임시로 1로 지정 로그인 붙으면 사용자 id로 변경 예정
        Long userId = 1L;

        RestaurantListItem item = restaurantListService.addItem(
                userId,
                listId,
                req.restaurantId(),
                req.comment(),
                req.orderIndex()
        );

        return RsData.success(
                new RestaurantListResponse.RestaurantListItemRes(item),
                "맛집 리스트에 식당이 추가되었습니다."
        );
    }
}
