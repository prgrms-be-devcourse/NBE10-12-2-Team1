package com.whattoeat.domain.restaurant.client;

import com.whattoeat.domain.restaurant.dto.KakaoPlaceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class KakaoMapApiClient {

    @Qualifier("kakaoMapWebClient")
    private final WebClient kakaoMapWebClient;

    @Value("${kakao.map.rest-api-key}")
    private String restApiKey;

    public KakaoPlaceResponse searchByKeyword(String query, double x, double y, int radius, int page){
        return kakaoMapWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", query)
                        .queryParam("x", x)
                        .queryParam("y", y)
                        .queryParam("radius", radius)
                        .queryParam("page", page)
                        .queryParam("size", 15)
                        .queryParam("category_group_code", "FD6")
                        .build())
                .header("Authorization", "KakaoAK " + restApiKey)
                .retrieve()
                .bodyToMono(KakaoPlaceResponse.class)
                .block();
    }
    public KakaoPlaceResponse searchByCategory(String categoryGroupCode, double x, double y, int radius) {
        return kakaoMapWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/category.json")
                        .queryParam("category_group_code", categoryGroupCode)
                        .queryParam("x", x)
                        .queryParam("y", y)
                        .queryParam("radius", radius)
                        .queryParam("size", 15)
                        .build())
                .header("Authorization", "KakaoAK " + restApiKey)
                .retrieve()
                .bodyToMono(KakaoPlaceResponse.class)
                .block();
    }
}
