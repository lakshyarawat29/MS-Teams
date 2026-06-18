package com.teamsclone.meeting.service;

import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.meeting.domain.Meeting;
import com.teamsclone.meeting.domain.MeetingParticipant;
import com.teamsclone.meeting.dto.CreateMeetingRequest;
import com.teamsclone.meeting.dto.MeetingResponse;
import com.teamsclone.meeting.repository.MeetingParticipantRepository;
import com.teamsclone.meeting.repository.MeetingRepository;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final UserRepository userRepository;

    public MeetingService(MeetingRepository meetingRepository,
                          MeetingParticipantRepository participantRepository,
                          UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MeetingResponse createMeeting(CreateMeetingRequest request, UUID organizerId) {
        Meeting meeting = Meeting.builder()
                .title(request.title())
                .description(request.description())
                .organizerId(organizerId)
                .teamId(request.teamId())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .build();
        meeting = meetingRepository.save(meeting);

        // Add organizer as participant
        participantRepository.save(MeetingParticipant.builder()
                .meetingId(meeting.getId())
                .userId(organizerId)
                .build());

        // Add additional participants
        if (request.participantIds() != null) {
            for (UUID pid : request.participantIds()) {
                if (!pid.equals(organizerId)) {
                    participantRepository.save(MeetingParticipant.builder()
                            .meetingId(meeting.getId())
                            .userId(pid)
                            .build());
                }
            }
        }

        return toResponse(meeting);
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> getUpcomingMeetings(UUID userId) {
        Instant now = Instant.now();
        Set<UUID> participatedMeetingIds = participantRepository.findByUserId(userId).stream()
                .map(MeetingParticipant::getMeetingId)
                .collect(Collectors.toSet());

        return meetingRepository.findAll().stream()
                .filter(m -> (m.getOrganizerId().equals(userId) || participatedMeetingIds.contains(m.getId()))
                        && m.getEndTime().isAfter(now))
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeeting(UUID meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.MEETING_NOT_FOUND, "Meeting not found"));
        return toResponse(meeting);
    }

    @Transactional
    public void deleteMeeting(UUID meetingId, UUID requestingUserId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.MEETING_NOT_FOUND, "Meeting not found"));
        if (!meeting.getOrganizerId().equals(requestingUserId)) {
            throw ApiException.forbidden(ErrorCode.ACCESS_DENIED, "Only the organizer can delete this meeting");
        }
        participantRepository.deleteByMeetingId(meetingId);
        meetingRepository.delete(meeting);
    }

    private MeetingResponse toResponse(Meeting meeting) {
        List<MeetingParticipant> participants = participantRepository.findByMeetingId(meeting.getId());
        User organizer = userRepository.findById(meeting.getOrganizerId()).orElse(null);

        List<MeetingResponse.ParticipantInfo> participantInfos = participants.stream().map(p -> {
            User u = userRepository.findById(p.getUserId()).orElse(null);
            return new MeetingResponse.ParticipantInfo(
                    p.getUserId(),
                    u != null ? u.getFirstName() : "Unknown",
                    u != null ? u.getLastName() : "");
        }).collect(Collectors.toList());

        return new MeetingResponse(
                meeting.getId(),
                meeting.getTitle(),
                meeting.getDescription(),
                meeting.getOrganizerId(),
                organizer != null ? organizer.getFirstName() + " " + organizer.getLastName() : "Unknown",
                meeting.getTeamId(),
                meeting.getStartTime(),
                meeting.getEndTime(),
                meeting.getCreatedAt(),
                participantInfos
        );
    }
}
