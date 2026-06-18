package com.teamsclone.channel.dto;

import java.time.Instant;
import java.util.UUID;

public record ChannelResponse(
        UUID id,
        UUID teamId,
        String name,
        String description,
        UUID createdBy,
        Instant createdAt
) {
}
