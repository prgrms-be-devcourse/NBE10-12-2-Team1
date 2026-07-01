package com.whattoeat.external.kakao.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.whattoeat.external.kakao.dto.KakaoPlaceResponse;
import com.whattoeat.global.exception.KakaoApiException;
import java.io.IOException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

class KakaoMapApiClientTest {

    private MockWebServer mockWebServer;
    private KakaoMapApiClient kakaoMapApiClient;

    private static final String SUCCESS_RESPONSE = """
            {
                "documents": [
                    {
                        "address_name": "서울 강남구 역삼동 123",
                        "id": "12345",
                        "phone": "02-1234-5678",
                        "road_address_name": "서울 강남구 테헤란로 123",
                        "x": 127.0276,
                        "y": 37.4979,
                        "category_name": "음식점 > 한식",
                        "place_name": "맛있는 한식당",
                        "distance": "100"
                    }
                ],
                "meta": {
                    "total_count": 1,
                    "pageable_count": 1,
                    "is_end": true
                }
            }
            """;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        kakaoMapApiClient = new KakaoMapApiClient(webClient);
        ReflectionTestUtils.setField(kakaoMapApiClient, "restApiKey", "test-api-key");
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    // ========== searchByKeyword ==========

    @Test
    @DisplayName("키워드 검색 성공 시 KakaoPlaceResponse 반환")
    void searchByKeyword_success() {
        mockWebServer.enqueue(new MockResponse()
                .setBody(SUCCESS_RESPONSE)
                .addHeader("Content-Type", "application/json"));

        KakaoPlaceResponse response = kakaoMapApiClient.searchByKeyword("한식", 127.0276, 37.4979, 500, 1);

        assertThat(response).isNotNull();
        assertThat(response.getDocuments()).hasSize(1);
        assertThat(response.getDocuments().get(0).getPlaceName()).isEqualTo("맛있는 한식당");
        assertThat(response.getDocuments().get(0).getId()).isEqualTo("12345");
        assertThat(response.getMeta().isEnd()).isTrue();
    }

    @Test
    @DisplayName("키워드 검색 시 4xx 응답이면 KakaoApiException 발생")
    void searchByKeyword_4xx_throwsKakaoApiException() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(401));

        assertThatThrownBy(() -> kakaoMapApiClient.searchByKeyword("한식", 127.0276, 37.4979, 500, 1))
                .isInstanceOf(KakaoApiException.class)
                .hasMessageContaining("카카오 API 요청 오류");
    }

    @Test
    @DisplayName("키워드 검색 시 5xx 응답이면 KakaoApiException 발생")
    void searchByKeyword_5xx_throwsKakaoApiException() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));

        assertThatThrownBy(() -> kakaoMapApiClient.searchByKeyword("한식", 127.0276, 37.4979, 500, 1))
                .isInstanceOf(KakaoApiException.class)
                .hasMessageContaining("카카오 API 서버 오류");
    }

    // ========== searchByCategory ==========

    @Test
    @DisplayName("카테고리 검색 성공 시 KakaoPlaceResponse 반환")
    void searchByCategory_success() {
        mockWebServer.enqueue(new MockResponse()
                .setBody(SUCCESS_RESPONSE)
                .addHeader("Content-Type", "application/json"));

        KakaoPlaceResponse response = kakaoMapApiClient.searchByCategory("FD6", 127.0276, 37.4979, 500);

        assertThat(response).isNotNull();
        assertThat(response.getDocuments()).hasSize(1);
        assertThat(response.getDocuments().get(0).getPlaceName()).isEqualTo("맛있는 한식당");
        assertThat(response.getMeta().isEnd()).isTrue();
    }

    @Test
    @DisplayName("카테고리 검색 시 4xx 응답이면 KakaoApiException 발생")
    void searchByCategory_4xx_throwsKakaoApiException() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(401));

        assertThatThrownBy(() -> kakaoMapApiClient.searchByCategory("FD6", 127.0276, 37.4979, 500))
                .isInstanceOf(KakaoApiException.class)
                .hasMessageContaining("카카오 API 요청 오류");
    }

    @Test
    @DisplayName("카테고리 검색 시 5xx 응답이면 KakaoApiException 발생")
    void searchByCategory_5xx_throwsKakaoApiException() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));

        assertThatThrownBy(() -> kakaoMapApiClient.searchByCategory("FD6", 127.0276, 37.4979, 500))
                .isInstanceOf(KakaoApiException.class)
                .hasMessageContaining("카카오 API 서버 오류");
    }
}
