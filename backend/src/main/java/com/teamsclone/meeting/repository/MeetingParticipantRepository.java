package com.teamsclone.meeting.repository;

import com.teamsclone.meeting.domain.MeetingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, UUID> {
    List<MeetingParticipant> findByMeetingId(UUID meetingId);
    List<MeetingParticipant> findByUserId(UUID userId);
    void deleteByMeetingId(UUID meetingId);
}
