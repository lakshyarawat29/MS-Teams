package com.teamsclone.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record EditMessageRequest(UUID messageId, @NotBlank @Size(max = 5000) String content) {}
