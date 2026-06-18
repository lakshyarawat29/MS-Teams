package com.teamsclone.search.controller;

import com.teamsclone.channel.domain.Channel;
import com.teamsclone.channel.dto.ChannelResponse;
import com.teamsclone.channel.repository.ChannelRepository;
import com.teamsclone.chat.domain.Message;
import com.teamsclone.chat.dto.MessageResponse;
import com.teamsclone.chat.dto.ReactionSummary;
import com.teamsclone.chat.repository.MessageRepository;
import com.teamsclone.chat.repository.ReactionRepository;
import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.security.CurrentUserResolver;
import com.teamsclone.user.dto.UserResponse;
import com.teamsclone.user.repository.UserRepository;
import com.teamsclone.user.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final ReactionRepository reactionRepository;
    private final UserService userService;
    private final CurrentUserResolver currentUserResolver;

    public SearchController(MessageRepository messageRepository,
                            ChannelRepository channelRepository,
                            UserRepository userRepository,
                            ReactionRepository reactionRepository,
                            UserService userService,
                            CurrentUserResolver currentUserResolver) {
        this.messageRepository = messageRepository;
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
        this.reactionRepository = reactionRepository;
        this.userService = userService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "all") String type) {

        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "messages", List.of(),
                    "channels", List.of(),
                    "users", List.of()
            )));
        }

        Map<String, Object> results = new HashMap<>();

        if ("all".equals(type) || "messages".equals(type)) {
            List<Message> messages = messageRepository.searchByContent(q, PageRequest.of(0, 20));
            List<MessageResponse> msgResponses = messages.stream().map(m -> {
                var sender = userRepository.findById(m.getSenderId()).orElse(null);
                var reactions = reactionRepository.findByMessageId(m.getId());
                Map<String, List<UUID>> grouped = new LinkedHashMap<>();
                for (var r : reactions) {
                    grouped.computeIfAbsent(r.getEmoji(), k -> new ArrayList<>()).add(r.getUserId());
                }
                List<ReactionSummary> summaries = grouped.entrySet().stream()
                        .map(e -> new ReactionSummary(e.getKey(), e.getValue().size(), e.getValue()))
                        .collect(Collectors.toList());
                return new MessageResponse(
                        m.getId(), m.getChannelId(), m.getSenderId(),
                        sender != null ? sender.getFirstName() : "Unknown",
                        sender != null ? sender.getLastName() : "",
                        m.getContent(), m.getEditedAt() != null, m.getEditedAt(),
                        m.getCreatedAt(), summaries);
            }).collect(Collectors.toList());
            results.put("messages", msgResponses);
        }

        if ("all".equals(type) || "channels".equals(type)) {
            List<Channel> channels = channelRepository.findByNameContainingIgnoreCaseOrderByNameAsc(q);
            List<ChannelResponse> channelResponses = channels.stream()
                    .map(c -> new ChannelResponse(c.getId(), c.getTeamId(), c.getName(),
                            c.getDescription(), c.getCreatedBy(), c.getCreatedAt()))
                    .collect(Collectors.toList());
            results.put("channels", channelResponses);
        }

        if ("all".equals(type) || "users".equals(type)) {
            List<UserResponse> users = userService.searchUsers(q);
            results.put("users", users);
        }

        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
