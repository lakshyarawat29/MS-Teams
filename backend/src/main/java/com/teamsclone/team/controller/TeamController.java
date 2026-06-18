package com.teamsclone.team.controller;

import com.teamsclone.channel.dto.ChannelResponse;
import com.teamsclone.channel.service.ChannelService;
import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.security.CurrentUserResolver;
import com.teamsclone.team.dto.*;
import com.teamsclone.team.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamController {

    private final TeamService teamService;
    private final ChannelService channelService;
    private final CurrentUserResolver currentUserResolver;

    public TeamController(TeamService teamService,
                          ChannelService channelService,
                          CurrentUserResolver currentUserResolver) {
        this.teamService = teamService;
        this.channelService = channelService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TeamResponse>> createTeam(
            @Valid @RequestBody CreateTeamRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        TeamResponse team = teamService.createTeam(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(team));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getMyTeams() {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        List<TeamResponse> teams = teamService.getMyTeams(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @GetMapping("/discover")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getAllTeams() {
        List<TeamResponse> teams = teamService.getAllTeams();
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<ApiResponse<TeamResponse>> getTeam(@PathVariable UUID teamId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        TeamResponse team = teamService.getTeamById(teamId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(team));
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<ApiResponse<TeamResponse>> updateTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody UpdateTeamRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        TeamResponse team = teamService.updateTeam(teamId, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(team));
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<ApiResponse<Void>> deleteTeam(@PathVariable UUID teamId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        teamService.deleteTeam(teamId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{teamId}/join")
    public ResponseEntity<ApiResponse<Void>> joinTeam(@PathVariable UUID teamId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        teamService.joinTeam(teamId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveTeam(@PathVariable UUID teamId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        teamService.leaveTeam(teamId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<ApiResponse<List<TeamMemberResponse>>> getTeamMembers(
            @PathVariable UUID teamId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        List<TeamMemberResponse> members = teamService.getTeamMembers(teamId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<ApiResponse<Void>> addMember(
            @PathVariable UUID teamId,
            @Valid @RequestBody AddMemberRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        teamService.addMember(teamId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID teamId,
            @PathVariable UUID userId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        teamService.removeMember(teamId, userId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{teamId}/channels")
    public ResponseEntity<ApiResponse<List<ChannelResponse>>> getTeamChannels(
            @PathVariable UUID teamId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        List<ChannelResponse> channels = channelService.getChannelsByTeam(teamId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(channels));
    }
}

