package com.teamsclone.channel.service;

import com.teamsclone.channel.domain.Channel;
import com.teamsclone.channel.dto.ChannelResponse;
import com.teamsclone.channel.dto.CreateChannelRequest;
import com.teamsclone.channel.dto.UpdateChannelRequest;
import com.teamsclone.channel.repository.ChannelRepository;
import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.team.repository.TeamMemberRepository;
import com.teamsclone.team.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    public ChannelService(ChannelRepository channelRepository,
                          TeamRepository teamRepository,
                          TeamMemberRepository teamMemberRepository) {
        this.channelRepository = channelRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    @Transactional
    public ChannelResponse createChannel(CreateChannelRequest request, UUID createdByUserId) {
        teamRepository.findById(request.teamId())
                .orElseThrow(() -> ApiException.notFound(ErrorCode.TEAM_NOT_FOUND, "Team not found"));

        assertTeamMember(request.teamId(), createdByUserId);

        if (channelRepository.existsByTeamIdAndName(request.teamId(), request.name())) {
            throw ApiException.conflict(ErrorCode.CHANNEL_NAME_ALREADY_EXISTS,
                    "A channel with this name already exists in the team");
        }

        Channel channel = Channel.builder()
                .teamId(request.teamId())
                .name(request.name())
                .description(request.description())
                .createdBy(createdByUserId)
                .build();

        return mapToResponse(channelRepository.save(channel));
    }

    @Transactional(readOnly = true)
    public ChannelResponse getChannelById(UUID channelId, UUID requestingUserId) {
        Channel channel = findChannelOrThrow(channelId);
        assertTeamMember(channel.getTeamId(), requestingUserId);
        return mapToResponse(channel);
    }

    @Transactional(readOnly = true)
    public List<ChannelResponse> getChannelsByTeam(UUID teamId, UUID requestingUserId) {
        teamRepository.findById(teamId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.TEAM_NOT_FOUND, "Team not found"));

        assertTeamMember(teamId, requestingUserId);

        return channelRepository.findByTeamIdOrderByCreatedAtAsc(teamId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChannelResponse updateChannel(UUID channelId, UpdateChannelRequest request, UUID requestingUserId) {
        Channel channel = findChannelOrThrow(channelId);
        assertTeamMember(channel.getTeamId(), requestingUserId);

        if (!channel.getName().equals(request.name()) &&
                channelRepository.existsByTeamIdAndName(channel.getTeamId(), request.name())) {
            throw ApiException.conflict(ErrorCode.CHANNEL_NAME_ALREADY_EXISTS,
                    "A channel with this name already exists");
        }

        channel.setName(request.name());
        channel.setDescription(request.description());
        return mapToResponse(channelRepository.save(channel));
    }

    @Transactional
    public void deleteChannel(UUID channelId, UUID requestingUserId) {
        Channel channel = findChannelOrThrow(channelId);
        assertTeamMember(channel.getTeamId(), requestingUserId);
        channelRepository.delete(channel);
    }

    private Channel findChannelOrThrow(UUID channelId) {
        return channelRepository.findById(channelId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.CHANNEL_NOT_FOUND, "Channel not found"));
    }

    private void assertTeamMember(UUID teamId, UUID userId) {
        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw ApiException.forbidden(ErrorCode.ACCESS_DENIED, "You are not a member of this team");
        }
    }

    private ChannelResponse mapToResponse(Channel channel) {
        return new ChannelResponse(
                channel.getId(),
                channel.getTeamId(),
                channel.getName(),
                channel.getDescription(),
                channel.getCreatedBy(),
                channel.getCreatedAt()
        );
    }
}
