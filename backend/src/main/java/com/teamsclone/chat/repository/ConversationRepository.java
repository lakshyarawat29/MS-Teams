package com.teamsclone.chat.repository;

import com.teamsclone.chat.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participant1Id = :userId OR c.participant2Id = :userId)")
    List<Conversation> findByParticipantId(UUID userId);

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participant1Id = :u1 AND c.participant2Id = :u2) OR " +
           "(c.participant1Id = :u2 AND c.participant2Id = :u1)")
    Optional<Conversation> findByParticipants(UUID u1, UUID u2);
}
