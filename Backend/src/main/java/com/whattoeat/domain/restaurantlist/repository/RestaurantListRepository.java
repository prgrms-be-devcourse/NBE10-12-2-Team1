package com.whattoeat.domain.restaurantlist.repository;

import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantListRepository extends JpaRepository<RestaurantList, Long> {
    List<RestaurantList> findByUserIdOrderByIdDesc(Long userId);

    Optional<RestaurantList> findByIdAndUserId(Long id, Long userId);
}
