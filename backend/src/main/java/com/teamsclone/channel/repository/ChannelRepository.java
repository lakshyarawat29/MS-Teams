package com.teamsclone.channel.repository;

import com.teamsclone.channel.domain.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, UUID> {

    List<Channel> findByTeamIdOrderByCreatedAtAsc(UUID teamId);

    boolean existsByTeamIdAndName(UUID teamId, String name);

    List<Channel> findByNameContainingIgnoreCaseOrderByNameAsc(String query);
}

