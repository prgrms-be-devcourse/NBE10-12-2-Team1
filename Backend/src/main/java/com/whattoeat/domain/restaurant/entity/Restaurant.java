package com.whattoeat.domain.restaurant.entity;

import com.whattoeat.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "restaurant")
@Getter
@NoArgsConstructor
public class Restaurant extends BaseEntity {
    // 카카오플레이스아이디
    @Column(name = "kakao_place_id", nullable = false, unique = true, length = 255)
    private String kakaoPlaceId;

    // 식당명
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    // 카테고리 : 한식/일식/양식 등
    @Column(name = "category", nullable = false, length = 100)
    private Category category;

    // 지번 주소
    @Column(name = "address", nullable = false, length = 300)
    private String address;

    // 도로명 주소
    @Column(name = "road_address", length = 300)
    private String roadAddress;

    // 시/도
    @Column(name = "region1", nullable = false, length = 50)
    private String region1;

    // 시/군/구
    @Column(name = "region2", nullable = false, length = 50)
    private String region2;

    // 읍/면/동
    @Column(name = "region3", length = 50)
    private String region3;

    // 전화번호
    @Column(name = "phone", length = 50)
    private String phone;

    // 위도
    @Column(name = "lat", nullable = false)
    private double lat;

    // 경도
    @Column(name = "lng", nullable = false)
    private double lng;

    public Restaurant(
            String kakaoPlaceId,
            String name,
            Category category,
            String address,
            String roadAddress,
            String region1,
            String region2,
            String region3,
            String phone,
            double lat,
            double lng
    ) {
        this.kakaoPlaceId = kakaoPlaceId;
        this.name = name;
        this.category = category;
        this.address = address;
        this.roadAddress = roadAddress;
        this.region1 = region1;
        this.region2 = region2;
        this.region3 = region3;
        this.phone = phone;
        this.lat = lat;
        this.lng = lng;
    }

}
