package com.teamsclone.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ReactionRequest(
        @NotNull UUID messageId,
        @NotBlank String emoji
) {}
