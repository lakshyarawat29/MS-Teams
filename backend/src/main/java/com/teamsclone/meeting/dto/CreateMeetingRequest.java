package com.teamsclone.meeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateMeetingRequest(
        @NotBlank(message = "Title is required") String title,
        String description,
        UUID teamId,
        @NotNull(message = "Start time is required") Instant startTime,
        @NotNull(message = "End time is required") Instant endTime,
        List<UUID> participantIds
) {
}
