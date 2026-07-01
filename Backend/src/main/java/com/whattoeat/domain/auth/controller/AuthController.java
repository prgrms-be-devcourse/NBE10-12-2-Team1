package com.whattoeat.domain.auth.controller;

import com.whattoeat.domain.auth.dto.LoginRequest;
import com.whattoeat.domain.auth.dto.LoginResponse;
import com.whattoeat.domain.auth.dto.SignUpRequest;
import com.whattoeat.domain.auth.service.AuthService;
import com.whattoeat.global.rsData.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<RsData<Void>> signup(@Valid @RequestBody SignUpRequest request){
        authService.signup(request);
        return ResponseEntity.ok(RsData.success(null, "회원가입이 완료되었습니다."));
    }
    @PostMapping("/login")
    public ResponseEntity<RsData<LoginResponse>> login(@Valid @RequestBody LoginRequest request){
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(RsData.success(response, "로그인 성공"));
    }

    //@PostMapping("/reissue")
    //public ResponseEntity<RsData<Void>> reissue(@Valid @RequestBody Map<String, String> request){}
}
