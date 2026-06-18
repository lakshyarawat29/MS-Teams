package com.teamsclone.meeting.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MeetingResponse(
        UUID id,
        String title,
        String description,
        UUID organizerId,
        String organizerName,
        UUID teamId,
        Instant startTime,
        Instant endTime,
        Instant createdAt,
        List<ParticipantInfo> participants
) {
    public record ParticipantInfo(UUID userId, String firstName, String lastName) {
    }
}
