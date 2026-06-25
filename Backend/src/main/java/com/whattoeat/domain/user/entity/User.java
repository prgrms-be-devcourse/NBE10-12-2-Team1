package com.whattoeat.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", length = 50, unique = true)
    private String loginId;

    @Column(length = 255)
    private String password;

    @Column(name = "kakao_id", length = 255, unique = true)
    private String kakaoId;

    @Column(length = 100, nullable = false)
    private String nickname;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(length = 100, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Role role = Role.USER;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Provider provider;

    @Builder
    public User(String loginId, String password, String kakaoId, String nickname,
                String profileImage, String email, Role role, Provider provider) {
        this.loginId = loginId;
        this.password = password;
        this.kakaoId = kakaoId;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.email = email;
        this.role = role != null ? role : Role.USER;
        this.provider = provider;
    }
}
