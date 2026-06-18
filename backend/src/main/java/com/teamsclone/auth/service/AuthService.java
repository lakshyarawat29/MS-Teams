package com.teamsclone.auth.service;

import com.teamsclone.auth.domain.RefreshToken;
import com.teamsclone.auth.dto.AuthResponse;
import com.teamsclone.auth.dto.LoginRequest;
import com.teamsclone.auth.dto.RefreshTokenRequest;
import com.teamsclone.auth.dto.RegisterRequest;
import com.teamsclone.auth.repository.RefreshTokenRepository;
import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.security.jwt.JwtTokenProvider;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.domain.UserRole;
import com.teamsclone.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;
    private final long jwtExpiration;
    private final long refreshExpiration;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager,
                       RefreshTokenRepository refreshTokenRepository,
                       @Value("${app.jwt.expiration}") long jwtExpiration,
                       @Value("${app.jwt.refresh-expiration:604800000}") long refreshExpiration) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtExpiration = jwtExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict(ErrorCode.USER_ALREADY_EXISTS, "Email is already registered");
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.USER)
                .build();

        user = userRepository.save(user);
        String accessToken = tokenProvider.generateToken(user.getEmail());
        String refreshToken = createRefreshToken(user.getId());
        return buildResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        String accessToken = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> ApiException.notFound(ErrorCode.USER_NOT_FOUND, "User not found"));

        String refreshToken = createRefreshToken(user.getId());
        return buildResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new ApiException(ErrorCode.REFRESH_TOKEN_INVALID,
                        "Invalid refresh token", HttpStatus.UNAUTHORIZED));

        if (stored.isUsed()) {
            throw new ApiException(ErrorCode.REFRESH_TOKEN_INVALID,
                    "Refresh token already used", HttpStatus.UNAUTHORIZED);
        }
        if (stored.isExpired()) {
            throw new ApiException(ErrorCode.REFRESH_TOKEN_EXPIRED,
                    "Refresh token expired", HttpStatus.UNAUTHORIZED);
        }

        // Rotate the token
        stored.setUsed(true);
        refreshTokenRepository.save(stored);

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> ApiException.notFound(ErrorCode.USER_NOT_FOUND, "User not found"));

        String newAccessToken = tokenProvider.generateToken(user.getEmail());
        String newRefreshToken = createRefreshToken(user.getId());
        return buildResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken())
                .ifPresent(rt -> {
                    rt.setUsed(true);
                    refreshTokenRepository.save(rt);
                });
    }

    private String createRefreshToken(java.util.UUID userId) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .userId(userId)
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    private AuthResponse buildResponse(User user, String accessToken, String refreshToken) {
        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtExpiration / 1000,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}

