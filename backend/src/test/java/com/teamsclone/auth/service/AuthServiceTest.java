package com.teamsclone.auth.service;

import com.teamsclone.auth.dto.AuthResponse;
import com.teamsclone.auth.dto.LoginRequest;
import com.teamsclone.auth.dto.RegisterRequest;
import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.security.jwt.JwtTokenProvider;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.domain.UserRole;
import com.teamsclone.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "jwtExpiration", 900000L);
    }

    @Test
    @DisplayName("register: given new email, should create user and return token")
    void register_newEmail_returnsAuthResponse() {
        RegisterRequest request = new RegisterRequest("John", "Doe", "john@test.com", "password123");
        User savedUser = buildUser("john@test.com");

        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateToken("john@test.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("john@test.com");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register: given existing email, should throw conflict exception")
    void register_existingEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest("John", "Doe", "john@test.com", "password123");

        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getErrorCode()).isEqualTo(ErrorCode.USER_ALREADY_EXISTS);
                });

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login: given valid credentials, should return token")
    void login_validCredentials_returnsAuthResponse() {
        LoginRequest request = new LoginRequest("john@test.com", "password123");
        User user = buildUser("john@test.com");
        var authentication = new UsernamePasswordAuthenticationToken("john@test.com", null);

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("jwt-token");
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request);

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("john@test.com");
    }

    @Test
    @DisplayName("login: given invalid credentials, should propagate authentication exception")
    void login_invalidCredentials_throwsException() {
        LoginRequest request = new LoginRequest("john@test.com", "wrong");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    private User buildUser(String email) {
        return User.builder()
                .id(UUID.randomUUID())
                .firstName("John")
                .lastName("Doe")
                .email(email)
                .passwordHash("hashed")
                .role(UserRole.USER)
                .build();
    }
}
