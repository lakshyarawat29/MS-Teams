package com.teamsclone.user.dto;

import com.teamsclone.user.domain.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull UserStatus status) {}
