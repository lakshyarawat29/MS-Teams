package com.teamsclone.channel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateChannelRequest(

        @NotNull(message = "Team ID is required")
        UUID teamId,

        @NotBlank(message = "Channel name is required")
        @Size(min = 1, max = 100, message = "Channel name must be at most 100 characters")
        String name,

        String description
) {
}
