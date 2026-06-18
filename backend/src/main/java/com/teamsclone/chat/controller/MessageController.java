package com.teamsclone.chat.controller;

import com.teamsclone.chat.dto.*;
import com.teamsclone.chat.service.MessageService;
import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.security.CurrentUserResolver;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Controller
@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;
    private final CurrentUserResolver currentUserResolver;

    public MessageController(MessageService messageService,
                             CurrentUserResolver currentUserResolver) {
        this.messageService = messageService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody SendMessageRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        MessageResponse message = messageService.sendMessage(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message));
    }

    @GetMapping("/channel/{channelId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable UUID channelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        List<MessageResponse> messages = messageService.getMessages(channelId, currentUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable UUID messageId,
            @Valid @RequestBody EditMessageRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        MessageResponse message = messageService.editMessage(messageId, request.content(), currentUserId);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable UUID messageId) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        messageService.deleteMessage(messageId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<ApiResponse<List<ReactionSummary>>> addReaction(
            @PathVariable UUID messageId,
            @Valid @RequestBody ReactionRequest request) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        List<ReactionSummary> reactions = messageService.addReaction(messageId, request.emoji(), currentUserId);
        return ResponseEntity.ok(ApiResponse.success(reactions));
    }

    @DeleteMapping("/{messageId}/reactions/{emoji}")
    public ResponseEntity<ApiResponse<List<ReactionSummary>>> removeReaction(
            @PathVariable UUID messageId,
            @PathVariable String emoji) {
        UUID currentUserId = currentUserResolver.getCurrentUserId();
        List<ReactionSummary> reactions = messageService.removeReaction(messageId, emoji, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(reactions));
    }

    @MessageMapping("/typing")
    public void handleTyping(@Payload TypingEvent event) {
        messageService.broadcastTyping(event);
    }
}

