package com.whattoeat.domain.restaurantlist.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

import com.whattoeat.domain.restaurant.entity.MoodTag;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurant.repository.RestaurantRepository;
import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;
import com.whattoeat.domain.restaurantlist.repository.RestaurantListItemRepository;
import com.whattoeat.domain.restaurantlist.repository.RestaurantListRepository;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.ListNotFoundException;
import com.whattoeat.global.exception.RestaurantListItemNotFoundException;
import com.whattoeat.global.exception.RestaurantNotFoundException;
import com.whattoeat.global.exception.UserNotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RestaurantListServiceTest {

    @Mock
    private RestaurantListRepository restaurantListRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestaurantListItemRepository restaurantListItemRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @InjectMocks
    private RestaurantListService restaurantListService;

    private User mockUser(Long id, String nickname) {
        User user = Mockito.mock(User.class);
        given(user.getId()).willReturn(id);
        given(user.getNickname()).willReturn(nickname);
        return user;
    }

    private Restaurant mockRestaurant(Long id, String name) {
        Restaurant restaurant = Mockito.mock(Restaurant.class);
        given(restaurant.getId()).willReturn(id);
        given(restaurant.getName()).willReturn(name);
        return restaurant;
    }

    private RestaurantList createRestaurantList(Long id, User user) {
        RestaurantList restaurantList = new RestaurantList(
                user,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        );

        ReflectionTestUtils.setField(restaurantList, "id", id);

        return restaurantList;
    }

    private RestaurantListItem createRestaurantListItem(
            Long id,
            RestaurantList restaurantList,
            Restaurant restaurant
    ) {
        RestaurantListItem item = new RestaurantListItem(
                restaurantList,
                restaurant,
                "한줄평",
                1
        );

        ReflectionTestUtils.setField(item, "id", id);

        return item;
    }

    @Test
    void create_성공() {
        User user = Mockito.mock(User.class);

        RestaurantList savedRestaurantList = new RestaurantList(
                user,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        );
        ReflectionTestUtils.setField(savedRestaurantList, "id", 1L);

        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(restaurantListRepository.save(any(RestaurantList.class)))
                .willReturn(savedRestaurantList);

        RestaurantList result = restaurantListService.create(
                1L,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        );

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("데이트 맛집");
        assertThat(result.getDescription()).isEqualTo("분위기 좋은 곳");
        assertThat(result.getMoodTag()).isEqualTo(MoodTag.DATE);
    }

    @Test
    void create_유저가_없으면_예외() {
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> restaurantListService.create(
                999L,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        ))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void findAllByUserId_성공() {
        User user = Mockito.mock(User.class);

        RestaurantList list1 = createRestaurantList(1L, user);
        RestaurantList list2 = createRestaurantList(2L, user);

        Pageable pageable = PageRequest.of(0, 10);

        given(restaurantListRepository.findByUserIdOrderByIdDesc(eq(1L), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(list2, list1), pageable, 2));

        Page<RestaurantList> result = restaurantListService.findAllByUserId(1L, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getId()).isEqualTo(2L);
        assertThat(result.getContent().get(1).getId()).isEqualTo(1L);

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(10);
    }

    @Test
    void findByIdAndUserId_성공() {
        User user = Mockito.mock(User.class);
        RestaurantList restaurantList = createRestaurantList(1L, user);

        given(restaurantListRepository.findByIdAndUserId(1L, 1L))
                .willReturn(Optional.of(restaurantList));

        RestaurantList result = restaurantListService.findByIdAndUserId(1L, 1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("데이트 맛집");
    }

    @Test
    void findByIdAndUserId_없으면_예외() {
        given(restaurantListRepository.findByIdAndUserId(999L, 1L))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> restaurantListService.findByIdAndUserId(999L, 1L))
                .isInstanceOf(ListNotFoundException.class);
    }

    @Test
    void addItem_성공() {
        User user = Mockito.mock(User.class);
        RestaurantList restaurantList = createRestaurantList(1L, user);
        Restaurant restaurant = mockRestaurant(10L, "초밥집");

        RestaurantListItem savedItem = createRestaurantListItem(
                1L,
                restaurantList,
                restaurant
        );

        given(restaurantListRepository.findByIdAndUserId(1L, 1L))
                .willReturn(Optional.of(restaurantList));

        given(restaurantRepository.findById(10L))
                .willReturn(Optional.of(restaurant));

        given(restaurantListItemRepository.save(any(RestaurantListItem.class)))
                .willReturn(savedItem);

        RestaurantListItem result = restaurantListService.addItem(
                1L,
                1L,
                10L,
                "한줄평",
                1
        );

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getRestaurantList().getId()).isEqualTo(1L);
        assertThat(result.getRestaurant().getId()).isEqualTo(10L);
        assertThat(result.getRestaurant().getName()).isEqualTo("초밥집");
        assertThat(result.getMemo()).isEqualTo("한줄평");
        assertThat(result.getOrderIndex()).isEqualTo(1);
    }

    @Test
    void addItem_리스트가_없으면_예외() {
        given(restaurantListRepository.findByIdAndUserId(999L, 1L))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> restaurantListService.addItem(
                1L,
                999L,
                10L,
                "한줄평",
                1
        ))
                .isInstanceOf(ListNotFoundException.class);
    }

    @Test
    void addItem_식당이_없으면_예외() {
        User user = Mockito.mock(User.class);
        RestaurantList restaurantList = createRestaurantList(1L, user);

        given(restaurantListRepository.findByIdAndUserId(1L, 1L))
                .willReturn(Optional.of(restaurantList));

        given(restaurantRepository.findById(999L))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> restaurantListService.addItem(
                1L,
                1L,
                999L,
                "한줄평",
                1
        ))
                .isInstanceOf(RestaurantNotFoundException.class);
    }

    @Test
    void updateItem_성공() {
        User user = Mockito.mock(User.class);
        RestaurantList restaurantList = createRestaurantList(1L, user);
        Restaurant restaurant = Mockito.mock(Restaurant.class);

        RestaurantListItem item = createRestaurantListItem(
                1L,
                restaurantList,
                restaurant
        );

        given(restaurantListRepository.findById(1L))
                .willReturn(Optional.of(restaurantList));

        given(restaurantListItemRepository.findListItem(1L, 1L, 1L))
                .willReturn(Optional.of(item));

        RestaurantListItem result = restaurantListService.updateItem(
                1L,
                1L,
                1L,
                2,
                "수정된 한줄평"
        );

        assertThat(result.getOrderIndex()).isEqualTo(2);
        assertThat(result.getMemo()).isEqualTo("수정된 한줄평");
    }

    @Test
    void updateItem_리스트가_없으면_예외() {
        given(restaurantListRepository.findById(999L))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> restaurantListService.updateItem(
                999L,
                1L,
                1L,
                2,
                "수정된 한줄평"
        ))
                .isInstanceOf(ListNotFoundException.class);
    }

    @Test
    void updateItem_아이템이_없으면_예외() {
        User user = Mockito.mock(User.class);
        RestaurantList restaurantList = createRestaurantList(1L, user);

        given(restaurantListRepository.findById(1L))
                .willReturn(Optional.of(restaurantList));

        given(restaurantListItemRepository.findListItem(999L, 1L, 1L))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> restaurantListService.updateItem(
                1L,
                999L,
                1L,
                2,
                "수정된 한줄평"
        ))
                .isInstanceOf(RestaurantListItemNotFoundException.class);
    }
}
