package com.teamsclone.team.service;

import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.team.domain.Team;
import com.teamsclone.team.domain.TeamMember;
import com.teamsclone.team.domain.TeamRole;
import com.teamsclone.team.dto.*;
import com.teamsclone.team.repository.TeamMemberRepository;
import com.teamsclone.team.repository.TeamRepository;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request, UUID ownerId) {
        Team team = Team.builder()
                .name(request.name())
                .description(request.description())
                .ownerId(ownerId)
                .build();

        team = teamRepository.save(team);

        TeamMember owner = TeamMember.builder()
                .teamId(team.getId())
                .userId(ownerId)
                .role(TeamRole.OWNER)
                .build();

        teamMemberRepository.save(owner);
        return mapToTeamResponse(team);
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamById(UUID teamId, UUID requestingUserId) {
        Team team = findTeamOrThrow(teamId);
        assertTeamMember(teamId, requestingUserId);
        return mapToTeamResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getMyTeams(UUID userId) {
        return teamRepository.findByMemberUserId(userId)
                .stream()
                .map(this::mapToTeamResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(this::mapToTeamResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamResponse updateTeam(UUID teamId, UpdateTeamRequest request, UUID requestingUserId) {
        Team team = findTeamOrThrow(teamId);
        assertOwnerOrAdmin(teamId, requestingUserId);
        team.setName(request.name());
        team.setDescription(request.description());
        return mapToTeamResponse(teamRepository.save(team));
    }

    @Transactional
    public void deleteTeam(UUID teamId, UUID requestingUserId) {
        Team team = findTeamOrThrow(teamId);
        if (!team.getOwnerId().equals(requestingUserId)) {
            throw ApiException.forbidden(ErrorCode.ACCESS_DENIED, "Only the team owner can delete the team");
        }
        teamRepository.delete(team);
    }

    @Transactional
    public void joinTeam(UUID teamId, UUID userId) {
        findTeamOrThrow(teamId);

        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw ApiException.conflict(ErrorCode.TEAM_MEMBER_ALREADY_EXISTS,
                    "You are already a member of this team");
        }

        TeamMember member = TeamMember.builder()
                .teamId(teamId)
                .userId(userId)
                .role(TeamRole.MEMBER)
                .build();

        teamMemberRepository.save(member);
    }

    @Transactional
    public void addMember(UUID teamId, AddMemberRequest request, UUID requestingUserId) {
        findTeamOrThrow(teamId);
        assertOwnerOrAdmin(teamId, requestingUserId);

        userRepository.findById(request.userId())
                .orElseThrow(() -> ApiException.notFound(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.userId())) {
            throw ApiException.conflict(ErrorCode.TEAM_MEMBER_ALREADY_EXISTS,
                    "User is already a member of this team");
        }

        TeamRole role = request.resolvedRole();
        if (role == TeamRole.OWNER) role = TeamRole.ADMIN; // Can't assign OWNER via API

        TeamMember member = TeamMember.builder()
                .teamId(teamId)
                .userId(request.userId())
                .role(role)
                .build();
        teamMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(UUID teamId, UUID targetUserId, UUID requestingUserId) {
        findTeamOrThrow(teamId);
        assertOwnerOrAdmin(teamId, requestingUserId);

        TeamMember target = teamMemberRepository.findByTeamIdAndUserId(teamId, targetUserId)
                .orElseThrow(() -> ApiException.notFound(
                        ErrorCode.TEAM_MEMBER_NOT_FOUND, "User is not a member of this team"));

        if (target.getRole() == TeamRole.OWNER) {
            throw ApiException.badRequest(ErrorCode.CANNOT_REMOVE_OWNER, "Cannot remove the team owner");
        }

        teamMemberRepository.deleteByTeamIdAndUserId(teamId, targetUserId);
    }

    @Transactional
    public void leaveTeam(UUID teamId, UUID userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> ApiException.notFound(
                        ErrorCode.TEAM_MEMBER_NOT_FOUND, "You are not a member of this team"));

        if (member.getRole() == TeamRole.OWNER) {
            throw ApiException.badRequest(ErrorCode.CANNOT_REMOVE_OWNER,
                    "Team owner cannot leave the team");
        }

        teamMemberRepository.deleteByTeamIdAndUserId(teamId, userId);
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getTeamMembers(UUID teamId, UUID requestingUserId) {
        findTeamOrThrow(teamId);
        assertTeamMember(teamId, requestingUserId);

        return teamMemberRepository.findByTeamId(teamId)
                .stream()
                .map(member -> {
                    User user = userRepository.findById(member.getUserId())
                            .orElseThrow(() -> ApiException.notFound(
                                    ErrorCode.USER_NOT_FOUND, "User not found"));
                    return new TeamMemberResponse(
                            user.getId(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getEmail(),
                            member.getRole(),
                            member.getJoinedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    private void assertOwnerOrAdmin(UUID teamId, UUID userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> ApiException.forbidden(ErrorCode.ACCESS_DENIED, "Not a team member"));
        if (member.getRole() == TeamRole.MEMBER) {
            throw ApiException.forbidden(ErrorCode.ACCESS_DENIED, "Only owners or admins can perform this action");
        }
    }

    private Team findTeamOrThrow(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.TEAM_NOT_FOUND, "Team not found"));
    }

    private void assertTeamMember(UUID teamId, UUID userId) {
        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw ApiException.forbidden(ErrorCode.ACCESS_DENIED, "You are not a member of this team");
        }
    }

    private TeamResponse mapToTeamResponse(Team team) {
        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getDescription(),
                team.getOwnerId(),
                team.getCreatedAt()
        );
    }
}
