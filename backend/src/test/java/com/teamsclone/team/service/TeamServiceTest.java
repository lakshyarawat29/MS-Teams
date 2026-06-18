package com.teamsclone.team.service;

import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.team.domain.Team;
import com.teamsclone.team.domain.TeamMember;
import com.teamsclone.team.domain.TeamRole;
import com.teamsclone.team.dto.CreateTeamRequest;
import com.teamsclone.team.dto.TeamResponse;
import com.teamsclone.team.repository.TeamMemberRepository;
import com.teamsclone.team.repository.TeamRepository;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.domain.UserRole;
import com.teamsclone.user.repository.UserRepository;
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
@DisplayName("TeamService Unit Tests")
class TeamServiceTest {

    @Mock private TeamRepository teamRepository;
    @Mock private TeamMemberRepository teamMemberRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private TeamService teamService;

    @Test
    @DisplayName("createTeam: should save team and add owner as OWNER member")
    void createTeam_validRequest_savesTeamAndOwnerMember() {
        UUID ownerId = UUID.randomUUID();
        CreateTeamRequest request = new CreateTeamRequest("Backend Team", "Platform Engineering");
        Team saved = buildTeam("Backend Team", ownerId);

        when(teamRepository.save(any(Team.class))).thenReturn(saved);

        TeamResponse response = teamService.createTeam(request, ownerId);

        assertThat(response.name()).isEqualTo("Backend Team");
        verify(teamMemberRepository).save(argThat(m -> m.getRole() == TeamRole.OWNER));
    }

    @Test
    @DisplayName("joinTeam: when user already member, should throw conflict")
    void joinTeam_alreadyMember_throwsConflict() {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(buildTeam("Test", userId)));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(true);

        assertThatThrownBy(() -> teamService.joinTeam(teamId, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    assertThat(((ApiException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.TEAM_MEMBER_ALREADY_EXISTS);
                });
    }

    @Test
    @DisplayName("joinTeam: when team not found, should throw not found")
    void joinTeam_teamNotFound_throwsNotFound() {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(teamRepository.findById(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.joinTeam(teamId, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    assertThat(((ApiException) ex).getErrorCode()).isEqualTo(ErrorCode.TEAM_NOT_FOUND);
                });
    }

    @Test
    @DisplayName("leaveTeam: when user is OWNER, should throw bad request")
    void leaveTeam_owner_throwsBadRequest() {
        UUID teamId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        TeamMember ownerMember = buildTeamMember(teamId, ownerId, TeamRole.OWNER);

        when(teamMemberRepository.findByTeamIdAndUserId(teamId, ownerId))
                .thenReturn(Optional.of(ownerMember));

        assertThatThrownBy(() -> teamService.leaveTeam(teamId, ownerId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    assertThat(((ApiException) ex).getErrorCode())
                            .isEqualTo(ErrorCode.CANNOT_REMOVE_OWNER);
                });
    }

    @Test
    @DisplayName("getTeamMembers: when not member, should throw forbidden")
    void getTeamMembers_notMember_throwsForbidden() {
        UUID teamId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(buildTeam("Test", UUID.randomUUID())));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(false);

        assertThatThrownBy(() -> teamService.getTeamMembers(teamId, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    assertThat(((ApiException) ex).getErrorCode()).isEqualTo(ErrorCode.ACCESS_DENIED);
                });
    }

    @Test
    @DisplayName("getMyTeams: should return teams for the user")
    void getMyTeams_returnsUserTeams() {
        UUID userId = UUID.randomUUID();
        List<Team> teams = List.of(buildTeam("Team A", userId), buildTeam("Team B", userId));

        when(teamRepository.findByMemberUserId(userId)).thenReturn(teams);

        List<TeamResponse> result = teamService.getMyTeams(userId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).name()).isEqualTo("Team A");
    }

    private Team buildTeam(String name, UUID ownerId) {
        return Team.builder()
                .id(UUID.randomUUID())
                .name(name)
                .ownerId(ownerId)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private TeamMember buildTeamMember(UUID teamId, UUID userId, TeamRole role) {
        return TeamMember.builder()
                .id(UUID.randomUUID())
                .teamId(teamId)
                .userId(userId)
                .role(role)
                .joinedAt(Instant.now())
                .build();
    }
}
