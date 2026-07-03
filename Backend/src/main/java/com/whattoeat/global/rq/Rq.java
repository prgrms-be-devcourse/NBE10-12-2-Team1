package com.whattoeat.global.rq;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class Rq {
    private final HttpServletRequest request;
    private final HttpServletResponse response;

    @Value("${cookie.secure:false}")
    private boolean secure;

    public String getCookieValue(String name, String defaultValue) {
        return Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst().orElse(defaultValue);
    }

    public String getCookieValue(String name) {
        return getCookieValue(name, null);
    }

    public void setCookie(String name, String value, int maxAge) {
        if (value == null) value = "";

        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge(value.isBlank() ? 0 : maxAge);
        response.addCookie(cookie);
    }

    public void setCookie(String name, String value) {
        setCookie(name, value, 60*60*24);
    }

    public void delCookie(String name) {
        setCookie(name, null);
    }

}
