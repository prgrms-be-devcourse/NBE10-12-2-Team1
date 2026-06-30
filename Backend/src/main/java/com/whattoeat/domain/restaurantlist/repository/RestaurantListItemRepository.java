package com.whattoeat.domain.restaurantlist.repository;

import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;


public interface RestaurantListItemRepository extends JpaRepository<RestaurantListItem, Long> {
    int countByRestaurantListId(Long restaurantListId);

    @Query("""
        select item
          from RestaurantListItem item
         where item.id = :itemId
           and item.restaurantList.id = :listId
           and item.restaurantList.user.id = :userId
    """)
    Optional<RestaurantListItem> findListItem(Long itemId, Long listId, Long userId);

    boolean existsByRestaurantListIdAndRestaurantId(Long listId, Long restaurantListId);
}
