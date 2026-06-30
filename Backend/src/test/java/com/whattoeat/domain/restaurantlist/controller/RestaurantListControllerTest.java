package com.whattoeat.domain.restaurantlist.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.whattoeat.domain.restaurant.entity.Category;
import com.whattoeat.domain.restaurant.entity.MoodTag;
import com.whattoeat.domain.restaurant.entity.Restaurant;
import com.whattoeat.domain.restaurantlist.dto.RestaurantListRequest;
import com.whattoeat.domain.restaurantlist.entity.RestaurantList;
import com.whattoeat.domain.restaurantlist.entity.RestaurantListItem;
import com.whattoeat.domain.restaurantlist.service.RestaurantListService;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.global.jwt.JwtUtil;
import com.whattoeat.global.security.CustomUserDetailsService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = RestaurantListController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class
)
class RestaurantListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @MockitoBean
    private RestaurantListService restaurantListService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private User mockUser(Long id, String nickname) {
        User user = Mockito.mock(User.class);
        given(user.getId()).willReturn(id);
        given(user.getNickname()).willReturn(nickname);
        return user;
    }

    private Restaurant mockRestaurant(Long id, String name, Category category) {
        Restaurant restaurant = Mockito.mock(Restaurant.class);
        given(restaurant.getId()).willReturn(id);
        given(restaurant.getName()).willReturn(name);
        given(restaurant.getCategory()).willReturn(category);
        return restaurant;
    }

    private RestaurantList createRestaurantList(
            Long id,
            User user,
            String title,
            String description,
            MoodTag moodTag
    ) {
        RestaurantList restaurantList = new RestaurantList(
                user,
                title,
                description,
                moodTag
        );

        ReflectionTestUtils.setField(restaurantList, "id", id);
        ReflectionTestUtils.setField(restaurantList, "createdAt", LocalDateTime.now());

        return restaurantList;
    }

    private RestaurantListItem createRestaurantListItem(
            Long id,
            RestaurantList restaurantList,
            Restaurant restaurant,
            String memo,
            Integer orderIndex
    ) {
        RestaurantListItem item = new RestaurantListItem(
                restaurantList,
                restaurant,
                memo,
                orderIndex
        );

        ReflectionTestUtils.setField(item, "id", id);
        ReflectionTestUtils.setField(item, "createdAt", LocalDateTime.now());

        return item;
    }

    @Test
    void 맛집리스트_생성_성공() throws Exception {
        RestaurantListRequest.RestaurantList request =
                new RestaurantListRequest.RestaurantList(
                        "데이트 맛집",
                        "분위기 좋은 곳",
                        MoodTag.DATE
                );

        User user = mockUser(1L, "user1");

        RestaurantList restaurantList = createRestaurantList(
                1L,
                user,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        );

        given(restaurantListService.create(
                eq(1L),
                eq("데이트 맛집"),
                eq("분위기 좋은 곳"),
                eq(MoodTag.DATE)
        )).willReturn(restaurantList);

        mockMvc.perform(post("/api/v1/lists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.nickname").value("user1"))
                .andExpect(jsonPath("$.data.title").value("데이트 맛집"))
                .andExpect(jsonPath("$.data.description").value("분위기 좋은 곳"))
                .andExpect(jsonPath("$.data.moodTag").value("DATE"))
                .andExpect(jsonPath("$.data.itemCount").value(0))
                .andExpect(jsonPath("$.data.createdAt").exists())
                .andExpect(jsonPath("$.message").value("맛집 리스트가 생성되었습니다."));
    }

    @Test
    void 맛집리스트_생성_title_blank면_400() throws Exception {
        RestaurantListRequest.RestaurantList request =
                new RestaurantListRequest.RestaurantList(
                        "",
                        "설명",
                        MoodTag.DATE
                );

        mockMvc.perform(post("/api/v1/lists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 내_맛집리스트_다건조회_성공() throws Exception {
        User user = mockUser(1L, "user1");

        RestaurantList list1 = createRestaurantList(
                1L,
                user,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        );

        RestaurantList list2 = createRestaurantList(
                2L,
                user,
                "혼밥 맛집",
                "혼자 먹기 좋은 곳",
                MoodTag.SOLO
        );

        given(restaurantListService.findAllByUserId(1L))
                .willReturn(List.of(list2, list1));

        mockMvc.perform(get("/api/v1/lists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))

                .andExpect(jsonPath("$.data[0].id").value(2))
                .andExpect(jsonPath("$.data[0].userId").value(1))
                .andExpect(jsonPath("$.data[0].nickname").value("user1"))
                .andExpect(jsonPath("$.data[0].title").value("혼밥 맛집"))
                .andExpect(jsonPath("$.data[0].description").value("혼자 먹기 좋은 곳"))
                .andExpect(jsonPath("$.data[0].moodTag").value("SOLO"))
                .andExpect(jsonPath("$.data[0].itemCount").value(0))
                .andExpect(jsonPath("$.data[0].createdAt").exists())

                .andExpect(jsonPath("$.data[1].id").value(1))
                .andExpect(jsonPath("$.data[1].title").value("데이트 맛집"))
                .andExpect(jsonPath("$.data[1].moodTag").value("DATE"))
                .andExpect(jsonPath("$.data[1].itemCount").value(0))
                .andExpect(jsonPath("$.data[1].createdAt").exists())
                .andExpect(jsonPath("$.message").value("맛집 리스트 목록 조회가 완료되었습니다."));
    }

    @Test
    void 내_맛집리스트_단건조회_성공() throws Exception {
        User user = mockUser(1L, "user1");

        Restaurant restaurant = mockRestaurant(
                10L,
                "초밥집",
                Category.JAPANESE
        );

        RestaurantList restaurantList = createRestaurantList(
                1L,
                user,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        );

        RestaurantListItem item = createRestaurantListItem(
                100L,
                restaurantList,
                restaurant,
                "한줄평",
                1
        );

        restaurantList.getItems().add(item);

        given(restaurantListService.findByIdAndUserId(1L, 1L))
                .willReturn(restaurantList);

        mockMvc.perform(get("/api/v1/lists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.listId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.nickname").value("user1"))
                .andExpect(jsonPath("$.data.title").value("데이트 맛집"))
                .andExpect(jsonPath("$.data.description").value("분위기 좋은 곳"))
                .andExpect(jsonPath("$.data.moodTag").value("DATE"))
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.items[0].id").value(100))
                .andExpect(jsonPath("$.data.items[0].listId").value(1))
                .andExpect(jsonPath("$.data.items[0].restaurantId").value(10))
                .andExpect(jsonPath("$.data.items[0].restaurantName").value("초밥집"))
                .andExpect(jsonPath("$.data.items[0].category").value("JAPANESE"))
                .andExpect(jsonPath("$.data.items[0].orderIndex").value(1))
                .andExpect(jsonPath("$.data.items[0].memo").value("한줄평"))
                .andExpect(jsonPath("$.data.items[0].createdAt").exists())
                .andExpect(jsonPath("$.data.createdAt").exists())
                .andExpect(jsonPath("$.message").value("맛집 리스트 조회가 완료되었습니다."));
    }

    @Test
    void 전체_맛집리스트_다건조회_성공() throws Exception {
        User user = mockUser(1L, "user1");

        RestaurantList list1 = createRestaurantList(
                1L,
                user,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        );

        RestaurantList list2 = createRestaurantList(
                2L,
                user,
                "혼밥 맛집",
                "혼자 먹기 좋은 곳",
                MoodTag.SOLO
        );

        given(restaurantListService.findAll())
                .willReturn(List.of(list2, list1));

        mockMvc.perform(get("/api/v1/lists/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].id").value(2))
                .andExpect(jsonPath("$.data[0].title").value("혼밥 맛집"))
                .andExpect(jsonPath("$.data[0].moodTag").value("SOLO"))
                .andExpect(jsonPath("$.data[1].id").value(1))
                .andExpect(jsonPath("$.data[1].title").value("데이트 맛집"))
                .andExpect(jsonPath("$.data[1].moodTag").value("DATE"))
                .andExpect(jsonPath("$.message").value("전체 맛집 리스트 목록 조회가 완료되었습니다."));
    }

    @Test
    void 전체_맛집리스트_단건조회_성공() throws Exception {
        User user = mockUser(1L, "user1");

        RestaurantList restaurantList = createRestaurantList(
                1L,
                user,
                "데이트 맛집",
                "분위기 좋은 곳",
                MoodTag.DATE
        );

        given(restaurantListService.findById(1L))
                .willReturn(restaurantList);

        mockMvc.perform(get("/api/v1/lists/all/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.listId").value(1))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.nickname").value("user1"))
                .andExpect(jsonPath("$.data.title").value("데이트 맛집"))
                .andExpect(jsonPath("$.data.description").value("분위기 좋은 곳"))
                .andExpect(jsonPath("$.data.moodTag").value("DATE"))
                .andExpect(jsonPath("$.data.items.length()").value(0))
                .andExpect(jsonPath("$.data.createdAt").exists())
                .andExpect(jsonPath("$.message").value("전체 맛집 리스트 조회가 완료되었습니다."));
    }
}
