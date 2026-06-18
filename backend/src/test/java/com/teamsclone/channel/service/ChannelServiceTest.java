package com.teamsclone.channel.service;

import com.teamsclone.channel.domain.Channel;
import com.teamsclone.channel.dto.ChannelResponse;
import com.teamsclone.channel.dto.CreateChannelRequest;
import com.teamsclone.channel.repository.ChannelRepository;
import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.team.domain.Team;
import com.teamsclone.team.repository.TeamMemberRepository;
import com.teamsclone.team.repository.TeamRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChannelService Unit Tests")
class ChannelServiceTest {

    @Mock private ChannelRepository channelRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private TeamMemberRepository teamMemberRepository;

    @InjectMocks
    private ChannelService channelService;

    @Test
    @DisplayName("createChannel: valid request, should create and return channel")
    void createChannel_validRequest_returnsChannelResponse() {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        CreateChannelRequest request = new CreateChannelRequest(teamId, "general", "General channel");
        Channel saved = buildChannel(teamId, "general", userId);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(buildTeam(teamId)));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(true);
        when(channelRepository.existsByTeamIdAndName(teamId, "general")).thenReturn(false);
        when(channelRepository.save(any(Channel.class))).thenReturn(saved);

        ChannelResponse response = channelService.createChannel(request, userId);

        assertThat(response.name()).isEqualTo("general");
        assertThat(response.teamId()).isEqualTo(teamId);
    }

    @Test
    @DisplayName("createChannel: duplicate name, should throw conflict")
    void createChannel_duplicateName_throwsConflict() {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        CreateChannelRequest request = new CreateChannelRequest(teamId, "general", null);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(buildTeam(teamId)));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(true);
        when(channelRepository.existsByTeamIdAndName(teamId, "general")).thenReturn(true);

        assertThatThrownBy(() -> channelService.createChannel(request, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    assertThat(((ApiException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.CHANNEL_NAME_ALREADY_EXISTS);
                });
    }

    @Test
    @DisplayName("getChannelsByTeam: when not team member, should throw forbidden")
    void getChannelsByTeam_notMember_throwsForbidden() {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(buildTeam(teamId)));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(false);

        assertThatThrownBy(() -> channelService.getChannelsByTeam(teamId, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    assertThat(((ApiException) ex).getErrorCode()).isEqualTo(ErrorCode.ACCESS_DENIED);
                });
    }

    @Test
    @DisplayName("getChannelsByTeam: when member, should return channels")
    void getChannelsByTeam_isMember_returnsChannels() {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        List<Channel> channels = List.of(
                buildChannel(teamId, "general", userId),
                buildChannel(teamId, "dev", userId)
        );

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(buildTeam(teamId)));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(true);
        when(channelRepository.findByTeamIdOrderByCreatedAtAsc(teamId)).thenReturn(channels);

        List<ChannelResponse> result = channelService.getChannelsByTeam(teamId, userId);

        assertThat(result).hasSize(2);
    }

    private Team buildTeam(UUID teamId) {
        return Team.builder()
                .id(teamId)
                .name("Test Team")
                .ownerId(UUID.randomUUID())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private Channel buildChannel(UUID teamId, String name, UUID createdBy) {
        return Channel.builder()
                .id(UUID.randomUUID())
                .teamId(teamId)
                .name(name)
                .createdBy(createdBy)
                .createdAt(Instant.now())
                .build();
    }
}
