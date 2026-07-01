package com.whattoeat.domain.restaurant.repository;

import com.whattoeat.domain.restaurant.entity.Category;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    @Query("SELECT r FROM Restaurant r WHERE " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:region1 IS NULL OR r.region1 = :region1) AND " +
           "(:region2 IS NULL OR r.region2 = :region2) AND " +
           "(:region3 IS NULL OR r.region3 = :region3)")
    List<Restaurant> findRecommended(
            @Param("category") Category category,
            @Param("region1") String region1,
            @Param("region2") String region2,
            @Param("region3") String region3
    );

    Optional<Restaurant> findByKakaoPlaceId(String kakaoPlaceId);
}
