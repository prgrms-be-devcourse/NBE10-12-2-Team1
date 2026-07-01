package com.whattoeat.domain.auth.service;

import com.whattoeat.domain.auth.dto.LoginRequest;
import com.whattoeat.domain.auth.dto.LoginResponse;
import com.whattoeat.domain.auth.dto.SignUpRequest;
import com.whattoeat.domain.auth.dto.TokenResponse;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.Role;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.*;
import com.whattoeat.global.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.Duration;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

    @Transactional
    public void signup(SignUpRequest request) {
        if (userRepository.existsByLoginId(request.loginId())) {
            throw new DuplicateLoginIdException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByNickname(request.nickname())) {
            throw new DuplicateNicknameException("이미 사용 중인 닉네임입니다.");
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateEmailException("이미 사용 중인 이메일입니다.");
        }
        if (!request.password().equals(request.passwordConfirm())) {
            throw new PasswordMismatchException("비밀번호가 일치하지 않습니다.");
        }
        User user = User.builder()
                .loginId(request.loginId())
                .password(passwordEncoder.encode(request.password()))
                .nickname(request.nickname())
                .email(request.email())
                .provider(Provider.LOCAL)
                .role(Role.USER)
                .build();
        userRepository.save(user);
    }

    public void saveRefreshToken(Long userId, String refreshToken) {
        redisTemplate.opsForValue().set(
                "refresh:" + userId,
                refreshToken,
                Duration.ofDays(7)
        );
    }

    @Transactional
    public TokenResponse reissue(String refreshToken) {
        Long userId = jwtUtil.getUserId(refreshToken);
        String savedRefreshToken = redisTemplate.opsForValue().get("refresh:" + userId);
        if (savedRefreshToken == null || !savedRefreshToken.equals(refreshToken)) {
            throw new InvalidCredentialsException("유효하지 않은 refreshToken입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(()->new InvalidCredentialsException("유효하지 않은 refreshToken입니다."));

        String newAccessToken = jwtUtil.generateAccessToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);

        saveRefreshToken(userId, newRefreshToken);
        return  new TokenResponse(newAccessToken, newRefreshToken);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new InvalidCredentialsException("아이디/비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("아이디/비밀번호가 올바르지 않습니다.");
        }
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        saveRefreshToken(user.getId(), refreshToken);
        return new LoginResponse(accessToken, refreshToken, user.getNickname(), user.getProfileImage());
    }
    public void logout(String token){
        long remaining = jwtUtil.getRemainingExpiration(token);
        if (remaining > 0) {
            redisTemplate.opsForValue().set("blacklist:" + token, "logout", remaining, TimeUnit.MILLISECONDS);
        }
    }
}
