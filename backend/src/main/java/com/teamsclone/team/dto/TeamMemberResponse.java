package com.teamsclone.team.dto;

import com.teamsclone.team.domain.TeamRole;

import java.time.Instant;
import java.util.UUID;

public record TeamMemberResponse(
        UUID userId,
        String firstName,
        String lastName,
        String email,
        TeamRole role,
        Instant joinedAt
) {
}
