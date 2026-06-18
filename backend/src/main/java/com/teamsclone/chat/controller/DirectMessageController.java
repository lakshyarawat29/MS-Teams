package com.teamsclone.chat.controller;

import com.teamsclone.chat.dto.ConversationResponse;
import com.teamsclone.chat.dto.DirectMessageResponse;
import com.teamsclone.chat.dto.SendDirectMessageRequest;
import com.teamsclone.chat.service.DirectMessageService;
import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.security.CurrentUserResolver;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dm")
public class DirectMessageController {

    private final DirectMessageService dmService;
    private final CurrentUserResolver currentUserResolver;

    public DirectMessageController(DirectMessageService dmService,
                                   CurrentUserResolver currentUserResolver) {
        this.dmService = dmService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getMyConversations() {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(dmService.getMyConversations(currentUserId)));
    }

    @PostMapping("/conversations/{userId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> openConversation(
            @PathVariable UUID userId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                dmService.getOrCreateConversation(currentUserId, userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DirectMessageResponse>> sendMessage(
            @Valid @RequestBody SendDirectMessageRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(dmService.sendMessage(currentUserId, request)));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<List<DirectMessageResponse>>> getMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                dmService.getMessages(conversationId, currentUserId, page, size)));
    }
}
