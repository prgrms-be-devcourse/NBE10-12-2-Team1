package com.whattoeat.domain.auth.service;

import com.whattoeat.domain.auth.dto.LoginRequest;
import com.whattoeat.domain.auth.dto.LoginResponse;
import com.whattoeat.domain.auth.dto.SignUpRequest;
import com.whattoeat.domain.user.entity.Provider;
import com.whattoeat.domain.user.entity.Role;
import com.whattoeat.domain.user.entity.User;
import com.whattoeat.domain.user.repository.UserRepository;
import com.whattoeat.global.exception.DuplicateLoginIdException;
import com.whattoeat.global.exception.DuplicateNicknameException;
import com.whattoeat.global.exception.InvalidCredentialsException;
import com.whattoeat.global.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public void signup(SignUpRequest request){
        if(userRepository.existsByLoginId(request.loginId())) {
            throw new DuplicateLoginIdException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByNickname(request.nickname())) {
            throw new DuplicateNicknameException("이미 사용 중인 닉네임입니다.");
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
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByLoginId(request.loginId())
                .orElseThrow(()-> new InvalidCredentialsException("아이디/비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("아이디/비밀번호가 올바르지 않습니다.");
        }
        String token =jwtUtil.generateToken(user);
        return new LoginResponse(token, user.getNickname(), user.getProfileImage());
    }
}
