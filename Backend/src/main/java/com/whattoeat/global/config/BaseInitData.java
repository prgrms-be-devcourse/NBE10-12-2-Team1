package com.whattoeat.global.config;

import com.whattoeat.domain.feed.entity.Feed;
import com.whattoeat.domain.feed.repository.FeedRepository;
import com.whattoeat.domain.follow.entity.Follow;
import com.whattoeat.domain.follow.repository.FollowRepository;
import com.whattoeat.domain.restaurant.entity.Category;
import com.whattoeat.domain.restaurant.entity.MoodTag;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;
import com.whattoeat.domain.restaurantlist.repository.RestaurantListItemRepository;
import com.whattoeat.domain.restaurantlist.repository.RestaurantListRepository;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.Role;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class BaseInitData implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RestaurantRepository  restaurantRepository;
    private final FeedRepository feedRepository;
    private final RestaurantListRepository restaurantListRepository;
    private final RestaurantListItemRepository restaurantListItemRepository;
    private final FollowRepository followRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args){
        if (userRepository.count() >0) {
            return; // 데이터 있으면 스킵
        }
        // 유저
        User user1 = userRepository.save(User.builder()
                .loginId("foodie@example.com")
                .password(passwordEncoder.encode("pass1234!"))
                .nickname("푸디보이")
                .email("foodie@example.com")
                .profileImage("https://example.com/profile1.png")
                .role(Role.USER)
                .provider(Provider.LOCAL)
                .build());

        User user2 = userRepository.save(User.builder()
                .loginId("date@example.com")
                .password(passwordEncoder.encode("pass1234!"))
                .nickname("데이트러버")
                .email("date@example.com")
                .profileImage("https://example.com/profile2.png")
                .role(Role.USER)
                .provider(Provider.LOCAL)
                .build());

        User user3 = userRepository.save(User.builder()
                .loginId("solo@example.com")
                .password(passwordEncoder.encode("pass1234!"))
                .nickname("혼밥마스터")
                .email("solo@example.com")
                .profileImage("https://example.com/profile3.png")
                .role(Role.USER)
                .provider(Provider.LOCAL)
                .build());

        User user4 = userRepository.save(User.builder()
                .loginId("friend@example.com")
                .password(passwordEncoder.encode("pass1234!"))
                .nickname("친구랑맛집")
                .email("friend@example.com")
                .profileImage("https://example.com/profile4.png")
                .role(Role.USER)
                .provider(Provider.LOCAL)
                .build());

        User user5 = userRepository.save(User.builder()
                .loginId("admin@example.com")
                .password(passwordEncoder.encode("admin1234!"))
                .nickname("관리자")
                .email("admin@example.com")
                .profileImage("https://example.com/admin.png")
                .role(Role.ADMIN)
                .provider(Provider.LOCAL)
                .build());

        // 식당
        Restaurant r1 = restaurantRepository.save(new Restaurant(
                "KAKAO_001", "을지로 곱창", Category.KOREAN,
                "서울 중구 을지로 123", "서울 중구 을지로 123길 45",
                "서울", "중구", "을지로", "02-1234-5678",
                37.5665, 126.9780));

        Restaurant r2 = restaurantRepository.save(new Restaurant(
                "KAKAO_002", "강남 파스타", Category.WESTERN,
                "서울 강남구 테헤란로 1", "서울 강남구 테헤란로 1길 10",
                "서울", "강남구", "역삼동", "02-1111-2222",
                37.5012, 127.0396));

        Restaurant r3 = restaurantRepository.save(new Restaurant(
                "KAKAO_003", "홍대 중국집", Category.CHINESE,
                "서울 마포구 홍익로 2", "서울 마포구 홍익로 2길 20",
                "서울", "마포구", "홍대입구", "02-3333-4444",
                37.5563, 126.9230));

        Restaurant r4 = restaurantRepository.save(new Restaurant(
                "KAKAO_004", "신촌 스시", Category.JAPANESE,
                "서울 서대구문안로 3", "서울 서대문구 연세로 3길 15",
                "서울", "서대문구", "신촌", "02-5555-6666",
                37.5599, 126.9345));

        Restaurant r5 = restaurantRepository.save(new Restaurant(
                "KAKAO_005", "성수 아시안", Category.ASIAN,
                "서울 성동구 성수이로 4", "서울 성동구 성수이로 4길 8",
                "서울", "성동구", "성수동", "02-7777-8888",
                37.5443, 127.0557));

        Restaurant r6 = restaurantRepository.save(new Restaurant(
                "KAKAO_006", "연남동 카페", Category.CAFE,
                "서울 마포구 연남로 5", "서울 마포구 연남로 5길 12",
                "서울", "마포구", "연남동", "02-9999-0000",
                37.5621, 126.9240));

        Restaurant r7 = restaurantRepository.save(new Restaurant(
                "KAKAO_007", "종로 분식", Category.SNACK,
                "서울 종로구 종로 6", "서울 종로구 종로 6길 7",
                "서울", "종로구", "종로", "02-1212-3434",
                37.5700, 126.9820));

        Restaurant r8 = restaurantRepository.save(new Restaurant(
                "KAKAO_008", "이태원 기타", Category.ETC,
                "서울 용산구 이태원로 7", "서울 용산구 이태원로 7길 21",
                "서울", "용산구", "이태원", "02-5656-7878",
                37.5345, 127.0010));

        // 피드
        Feed f1 = feedRepository.save(Feed.builder()
                .user(user1).restaurant(r1)
                .content("을지로 곱창 진짜 최고! 분위기도 좋고 맛도 좋았어요.")
                .build());

        Feed f2 = feedRepository.save(Feed.builder()
                .user(user1).restaurant(r2)
                .content("강남 파스타 데이트하기 딱 좋은 곳이에요.")
                .build());

        Feed f3 = feedRepository.save(Feed.builder()
                .user(user2).restaurant(r3)
                .content("홍대 중국집 짜장면이 일품입니다.")
                .build());

        Feed f4 = feedRepository.save(Feed.builder()
                .user(user3).restaurant(r4)
                .content("혼자 가도 편한 신촌 스시집.")
                .build());

        Feed f5 = feedRepository.save(Feed.builder()
                .user(user4).restaurant(r5)
                .content("성수 아시안 음식점, 친구들이랑 가기 좋아요.")
                .build());

        Feed f6 = feedRepository.save(Feed.builder()
                .user(user2).restaurant(r6)
                .content("연남동 카페 분위기 예쁘고 커피도 맛있어요.")
                .build());

        Feed f7 = feedRepository.save(Feed.builder()
                .user(user3).restaurant(r7)
                .content("종로 분식 떡볶이 강추!")
                .build());

        Feed f8 = feedRepository.save(Feed.builder()
                .user(user5).restaurant(r8)
                .content("이태원에서 발견한 힙한 맛집.")
                .build());

        // 팔로우 관계
        followRepository.save(Follow.of(user2, user1)); // user2가 user1 팔로우
        followRepository.save(Follow.of(user3, user1)); // user3가 user1 팔로우
        followRepository.save(Follow.of(user4, user2)); // user4가 user2 팔로우

        // 맛집 리스트
        RestaurantList list1 = restaurantListRepository.save(
                new RestaurantList(user1, "을지로 데이트 코스", "분위기 좋은 을지로 맛집 모음",
                        MoodTag.DATE));

        RestaurantList list2 = restaurantListRepository.save(
                new RestaurantList(user2, "혼밥 맛집 리스트", "혼자서도 편하게 먹을 수 있는 곳",
                        MoodTag.SOLO));

        RestaurantList list3 = restaurantListRepository.save(
                new RestaurantList(user4, "친구들과 함께", "단체로 가기 좋은 맛집", MoodTag.FRIENDS));

        // 리스트 아이템
        restaurantListItemRepository.save(new RestaurantListItem(list1, r1, "곱창이 정말 부드러워요", 0));
        restaurantListItemRepository.save(new RestaurantListItem(list1, r6, "식후 커피로 딱", 1));

        restaurantListItemRepository.save(new RestaurantListItem(list2, r4, "혼자 앉아먹기 좋음", 0));
        restaurantListItemRepository.save(new RestaurantListItem(list2, r7, "떡볶이가 인기", 1));

        restaurantListItemRepository.save(new RestaurantListItem(list3, r5, "단체석 있음", 0));
        restaurantListItemRepository.save(new RestaurantListItem(list3, r8, "외국인 친구랑 가기 좋음", 1));

    }
}
