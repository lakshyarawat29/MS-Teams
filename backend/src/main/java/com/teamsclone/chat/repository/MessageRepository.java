package com.teamsclone.chat.repository;

import com.teamsclone.chat.domain.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByChannelIdAndDeletedFalseOrderByCreatedAtAsc(UUID channelId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.deleted = false AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY m.createdAt DESC")
    List<Message> searchByContent(@Param("query") String query, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.channelId = :channelId AND m.deleted = false AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY m.createdAt DESC")
    List<Message> searchByChannelAndContent(@Param("channelId") UUID channelId, @Param("query") String query, Pageable pageable);
}

