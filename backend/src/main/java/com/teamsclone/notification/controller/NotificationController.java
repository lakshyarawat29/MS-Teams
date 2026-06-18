package com.teamsclone.notification.controller;

import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.notification.dto.NotificationResponse;
import com.teamsclone.notification.service.NotificationService;
import com.teamsclone.security.CurrentUserResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserResolver currentUserResolver;

    public NotificationController(NotificationService notificationService,
                                  CurrentUserResolver currentUserResolver) {
        this.notificationService = notificationService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        UUID userId = currentUserResolver.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(userId)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        UUID userId = currentUserResolver.getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        UUID userId = currentUserResolver.getCurrentUserId();
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable UUID notificationId) {
        UUID userId = currentUserResolver.getCurrentUserId();
        notificationService.markRead(notificationId, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
