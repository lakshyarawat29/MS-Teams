package com.teamsclone.notification.dto;

import com.teamsclone.notification.domain.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String body,
        boolean read,
        UUID referenceId,
        Instant createdAt
) {}
