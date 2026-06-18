package com.teamsclone.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record DirectMessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String senderFirstName,
        String senderLastName,
        String content,
        boolean edited,
        Instant editedAt,
        Instant createdAt
) {}
