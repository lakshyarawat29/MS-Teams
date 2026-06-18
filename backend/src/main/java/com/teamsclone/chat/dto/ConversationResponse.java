package com.teamsclone.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        UUID participantId,
        String participantFirstName,
        String participantLastName,
        String participantEmail,
        String participantStatus,
        Instant createdAt
) {}
