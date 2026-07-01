package com.whattoeat.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl("https://kapi.kakao.com")
                .build();
    }
    @Bean
    public WebClient kakaoMapWebClient() {
        return WebClient.builder()
                .baseUrl("https://dapi.kakao.com")
                .build();
    }
}
