package com.teamsclone.user.dto;

import com.teamsclone.user.domain.UserStatus;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String avatarUrl,
        String bio,
        UserStatus status,
        Instant lastSeen
) {
}
