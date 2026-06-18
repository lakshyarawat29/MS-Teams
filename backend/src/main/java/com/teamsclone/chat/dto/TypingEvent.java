package com.teamsclone.chat.dto;

import java.util.UUID;

public record TypingEvent(UUID userId, String firstName, String channelId) {}
