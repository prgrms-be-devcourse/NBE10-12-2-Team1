package com.whattoeat.domain.restaurantlist.repository;

import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantListRepository extends JpaRepository<RestaurantList, Long> {
}
