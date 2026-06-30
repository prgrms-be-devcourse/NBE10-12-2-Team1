package com.whattoeat.global.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomOAuth2AuthorizationRequestResolver {
    private final ClientRegistrationRepository clientRegistrationRepository;

    private DefaultOAuth2AuthorizationRequestResolver defaultResolver() {
        return new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository,
                OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI
        );
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest authRequest = defaultResolver().resolve(request);
        return customize(authRequest, request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegiId) {
        OAuth2AuthorizationRequest authRequest = defaultResolver().resolve(request, clientRegiId);
        return customize(authRequest, request);
    }

    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest authRequest,
                                                 HttpServletRequest request) {
        if (authRequest == null) return null;

        String redirectUrl = request.getParameter("redirectUrl");
        if (redirectUrl == null || redirectUrl.isBlank()) redirectUrl = "http://localhost:3000";

        String originState = UUID.randomUUID().toString();
        String rawState = redirectUrl + "#" + originState;
        String encodeState = Base64.getUrlEncoder().
                encodeToString(rawState.getBytes(StandardCharsets.UTF_8));

        return OAuth2AuthorizationRequest.from(authRequest)
                .state(encodeState).build();
    }
}
