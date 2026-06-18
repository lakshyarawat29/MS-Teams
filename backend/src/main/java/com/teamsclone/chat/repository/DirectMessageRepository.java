package com.teamsclone.chat.repository;

import com.teamsclone.chat.domain.DirectMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DirectMessageRepository extends JpaRepository<DirectMessage, UUID> {

    List<DirectMessage> findByConversationIdAndDeletedFalseOrderByCreatedAtAsc(
            UUID conversationId, Pageable pageable);
}
