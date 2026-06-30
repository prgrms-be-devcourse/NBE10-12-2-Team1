package com.whattoeat.global.rq;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

public class RqTest {

    @Test
    @DisplayName("쿠키 생성")
    void cookieCreate(){
        var req = new MockHttpServletRequest();
        var res = new MockHttpServletResponse();
        var rq = new Rq(req,res);

        rq.setCookie("at","val");
        Cookie c = res.getCookie("at");
        assertThat(c).isNotNull();
        assertThat(c.getValue()).isEqualTo("val");
    }

    @Test
    @DisplayName("보안 설정")
    void setCookie_secure(){
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();
        var rq = new Rq(req,res);

        rq .setCookie("at","val");
        Cookie c = res.getCookie("at");
        assertThat(c.isHttpOnly()).isTrue();
        assertThat(c.getPath()).isEqualTo("/");
    }
}
