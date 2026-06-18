package com.teamsclone.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SendMessageRequest(

        @NotNull(message = "Channel ID is required")
        UUID channelId,

        @NotBlank(message = "Message content is required")
        String content
) {
}
