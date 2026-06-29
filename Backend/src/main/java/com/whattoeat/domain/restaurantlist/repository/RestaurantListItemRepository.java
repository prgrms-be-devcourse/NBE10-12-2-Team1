package com.whattoeat.domain.restaurantlist.repository;

import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;
import org.springframework.data.jpa.repository.JpaRepository;


public interface RestaurantListItemRepository extends JpaRepository<RestaurantListItem, Long> {
}
