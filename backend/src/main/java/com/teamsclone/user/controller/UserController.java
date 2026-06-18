package com.teamsclone.user.controller;

import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.security.CurrentUserResolver;
import com.teamsclone.user.dto.UpdateProfileRequest;
import com.teamsclone.user.dto.UpdateStatusRequest;
import com.teamsclone.user.dto.UserResponse;
import com.teamsclone.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final CurrentUserResolver currentUserResolver;

    public UserController(UserService userService, CurrentUserResolver currentUserResolver) {
        this.userService = userService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UUID userId = currentUserResolver.getCurrentUserId();
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = currentUserResolver.getCurrentUserId();
        UserResponse user = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PatchMapping("/me/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @Valid @RequestBody UpdateStatusRequest request) {
        UUID userId = currentUserResolver.getCurrentUserId();
        UserResponse user = userService.updateStatus(userId, request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID userId) {
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @RequestParam String q) {
        List<UserResponse> users = userService.searchUsers(q);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}

