package com.whattoeat.domain.restaurantlist.repository;

import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantListRepository extends JpaRepository<RestaurantList, Long> {
    // 내 리스트 조회 : 최신 생성 리스트가 위로 오게 id 내림차순
    Page<RestaurantList> findByUserIdOrderByIdDesc(Long userId, Pageable pageable);

    Optional<RestaurantList> findByIdAndUserId(Long id, Long userId);
}
