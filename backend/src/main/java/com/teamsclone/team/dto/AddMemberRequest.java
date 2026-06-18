package com.teamsclone.team.dto;

import com.teamsclone.team.domain.TeamRole;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AddMemberRequest(
        @NotNull UUID userId,
        TeamRole role
) {
    public TeamRole resolvedRole() {
        return role != null ? role : TeamRole.MEMBER;
    }
}
