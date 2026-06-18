package com.teamsclone.team.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTeamRequest(

        @NotBlank(message = "Team name is required")
        @Size(min = 1, max = 100, message = "Team name must be at most 100 characters")
        String name,

        String description
) {
}
