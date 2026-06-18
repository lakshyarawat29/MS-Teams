package com.teamsclone.channel.controller;

import com.teamsclone.channel.dto.ChannelResponse;
import com.teamsclone.channel.dto.CreateChannelRequest;
import com.teamsclone.channel.dto.UpdateChannelRequest;
import com.teamsclone.channel.service.ChannelService;
import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.security.CurrentUserResolver;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/channels")
public class ChannelController {

    private final ChannelService channelService;
    private final CurrentUserResolver currentUserResolver;

    public ChannelController(ChannelService channelService,
                             CurrentUserResolver currentUserResolver) {
        this.channelService = channelService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChannelResponse>> createChannel(
            @Valid @RequestBody CreateChannelRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        ChannelResponse channel = channelService.createChannel(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(channel));
    }

    @GetMapping("/{channelId}")
    public ResponseEntity<ApiResponse<ChannelResponse>> getChannel(
            @PathVariable UUID channelId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        ChannelResponse channel = channelService.getChannelById(channelId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(channel));
    }

    @PutMapping("/{channelId}")
    public ResponseEntity<ApiResponse<ChannelResponse>> updateChannel(
            @PathVariable UUID channelId,
            @Valid @RequestBody UpdateChannelRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        ChannelResponse channel = channelService.updateChannel(channelId, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(channel));
    }

    @DeleteMapping("/{channelId}")
    public ResponseEntity<ApiResponse<Void>> deleteChannel(
            @PathVariable UUID channelId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        channelService.deleteChannel(channelId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
