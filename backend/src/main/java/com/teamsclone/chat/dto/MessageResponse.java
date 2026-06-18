package com.teamsclone.chat.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID channelId,
        UUID senderId,
        String senderFirstName,
        String senderLastName,
        String content,
        boolean edited,
        Instant editedAt,
        Instant createdAt,
        List<ReactionSummary> reactions
) {
}
