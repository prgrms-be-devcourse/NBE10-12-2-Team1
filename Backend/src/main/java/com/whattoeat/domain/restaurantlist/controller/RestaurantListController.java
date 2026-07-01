package com.whattoeat.domain.restaurantlist.controller;

import com.whattoeat.domain.restaurantlist.dto.RestaurantListRequest;
import com.whattoeat.domain.restaurantlist.dto.RestaurantListResponse;
import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;
import com.whattoeat.domain.restaurantlist.service.RestaurantListService;
import com.whattoeat.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lists")
@RequiredArgsConstructor
public class RestaurantListController {
    private final RestaurantListService restaurantListService;

    // ============================== 내 정보 조회 =================================
    // 맛집 리스트 등록
    @PostMapping
    public RsData<RestaurantListResponse.RestaurantLists> createRestaurantList(
           @Valid @RequestBody RestaurantListRequest.RestaurantList req
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
    public RsData<List<RestaurantListResponse.RestaurantLists>> getRestaurantLists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "0") int size
    ) {
        // 임시로 1로 지정 로그인 붙으면 사용자 id로 변경 예정
        Long userId = 1L;

        Pageable pageable = PageRequest.of(page, size);

        List<RestaurantListResponse.RestaurantLists> restaurantLists = restaurantListService.findAllByUserId(userId, pageable)
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
    @PostMapping("/{id}/items")
    @Operation(summary = "맛집 리스트 아이템 등록")
    public RsData<RestaurantListResponse.RestaurantListItemDetail> createRestaurantListItem(
            @PathVariable("id") Long listId,
            @Valid @RequestBody RestaurantListRequest.RestaurantListItem req
    ) {
        // 임시로 1로 지정 로그인 붙으면 사용자 id로 변경 예정
        Long userId = 1L;

        RestaurantListItem item = restaurantListService.addItem(
                userId,
                listId,
                req.restaurantId(),
                req.memo(),
                req.orderIndex()
        );

        return RsData.success(
                new RestaurantListResponse.RestaurantListItemDetail(item),
                "맛집 리스트에 식당이 추가되었습니다."
        );
    }

    @PutMapping("/{id}/items/{itemId}")
    @Operation(summary = "식당 리스트 아이템 수정(순서/메모)")
    public RsData<RestaurantListResponse.RestaurantListItemDetail> updateRestaurantListItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody RestaurantListRequest.RestaurantListItem req
    ) {
        // 임시로 1로 지정 로그인 붙으면 사용자 id로 변경 예정
        Long userId = 1L;

        RestaurantListItem item = restaurantListService.updateItem(
                id, // listId
                itemId,
                userId,
                req.orderIndex(),
                req.memo()
        );

        return RsData.success(
                new RestaurantListResponse.RestaurantListItemDetail(item),
                "리스트 아이템 정보가 변경되었습니다."
        );
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @Operation(summary = "맛집 리스트 아이템 삭제")
    public RsData<Void> deleteRestaurantListItem(
            @PathVariable Long id, // listId
            @PathVariable Long itemId
    ) {
        Long userId = 1L;

        // 나중에 인증 추가 사용자일 경우에만 삭제가능하도록 수정
        restaurantListService.deleteItem(id, itemId, userId);

        return RsData.success(
                null,
                "리스트 아이템이 삭제되었습니다."
        );
    }

    // ============================== 전체 조회 =================================

    // 전체 맛집 리스트 다건 조회
    @GetMapping("/all")
    @Operation(summary = "전체 맛집 리스트 다건 조회")
    public RsData<List<RestaurantListResponse.RestaurantLists>> getAllRestaurantLists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "0") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        List<RestaurantListResponse.RestaurantLists> restaurantLists = restaurantListService.findAll(pageable)
                        .stream()
                .map(RestaurantListResponse.RestaurantLists::new)
                .toList();

        return RsData.success(
                restaurantLists,
                "전체 맛집 리스트 목록 조회가 완료되었습니다."
        );
    }

    // 전체 맛집 리스트 단건 조회
    @GetMapping("/all/{id}")
    @Operation(summary = "전체 맛집 리스트 단건 조회")
    public RsData<RestaurantListResponse.RestaurantListDetail> getAllRestaurantListsDetail(
            @PathVariable Long id
    ) {
        RestaurantList restaurantList = restaurantListService.findById(id);

        return RsData.success(
                new RestaurantListResponse.RestaurantListDetail(restaurantList),
                "전체 맛집 리스트 조회가 완료되었습니다."
        );
    }

}
