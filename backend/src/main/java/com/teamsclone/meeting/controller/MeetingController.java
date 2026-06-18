package com.teamsclone.meeting.controller;

import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.meeting.dto.CreateMeetingRequest;
import com.teamsclone.meeting.dto.MeetingResponse;
import com.teamsclone.meeting.service.MeetingService;
import com.teamsclone.security.CurrentUserResolver;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings")
public class MeetingController {

    private final MeetingService meetingService;
    private final CurrentUserResolver currentUserResolver;

    public MeetingController(MeetingService meetingService, CurrentUserResolver currentUserResolver) {
        this.meetingService = meetingService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MeetingResponse>> createMeeting(
            @Valid @RequestBody CreateMeetingRequest request) {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(meetingService.createMeeting(request, userId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MeetingResponse>>> getUpcomingMeetings() {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(meetingService.getUpcomingMeetings(userId)));
    }

    @GetMapping("/{meetingId}")
    public ResponseEntity<ApiResponse<MeetingResponse>> getMeeting(@PathVariable UUID meetingId) {
        return ResponseEntity.ok(ApiResponse.success(meetingService.getMeeting(meetingId)));
    }

    @DeleteMapping("/{meetingId}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable UUID meetingId) {
        UUID userId = currentUserResolver.getCurrentUserId();
        meetingService.deleteMeeting(meetingId, userId);
        return ResponseEntity.noContent().build();
    }
}
