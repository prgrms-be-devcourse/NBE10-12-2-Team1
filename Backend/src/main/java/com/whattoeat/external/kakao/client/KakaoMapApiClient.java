package com.whattoeat.external.kakao.client;

import com.whattoeat.external.kakao.dto.KakaoPlaceResponse;
import com.whattoeat.global.exception.KakaoApiException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class KakaoMapApiClient {
    private final WebClient kakaoMapWebClient;

    @Value("${kakao.map.rest-api-key}")
    private String restApiKey;

    public KakaoMapApiClient(@Qualifier("kakaoMapWebClient") WebClient kakaoMapWebClient) {
        this.kakaoMapWebClient = kakaoMapWebClient;
    }


    public KakaoPlaceResponse searchByKeyword(String query, Double x, Double y, int radius, int page){
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
                .onStatus(HttpStatusCode::is4xxClientError, clientResponse -> Mono.error(new KakaoApiException("카카오 API 요청 오류 :" + clientResponse.statusCode())))
                .onStatus(HttpStatusCode::is5xxServerError, clientResponse -> Mono.error(new KakaoApiException("카카오 API 서버 오류")))
                .bodyToMono(KakaoPlaceResponse.class)
                .block();
    }
    public KakaoPlaceResponse searchByCategory(String categoryGroupCode, Double x, Double y, int radius) {
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
                .onStatus(HttpStatusCode::is4xxClientError, clientResponse -> Mono.error(new KakaoApiException("카카오 API 요청 오류 :" + clientResponse.statusCode())))
                .onStatus(HttpStatusCode::is5xxServerError, clientResponse -> Mono.error(new KakaoApiException("카카오 API 서버 오류")))
                .bodyToMono(KakaoPlaceResponse.class)
                .block();
    }
}
