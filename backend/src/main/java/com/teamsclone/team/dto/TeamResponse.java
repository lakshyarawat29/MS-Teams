package com.teamsclone.team.dto;

import java.time.Instant;
import java.util.UUID;

public record TeamResponse(
        UUID id,
        String name,
        String description,
        UUID ownerId,
        Instant createdAt
) {
}
