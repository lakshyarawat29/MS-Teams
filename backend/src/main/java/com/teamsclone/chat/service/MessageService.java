package com.teamsclone.chat.service;

import com.teamsclone.channel.repository.ChannelRepository;
import com.teamsclone.chat.domain.Message;
import com.teamsclone.chat.domain.Reaction;
import com.teamsclone.chat.dto.*;
import com.teamsclone.chat.repository.MessageRepository;
import com.teamsclone.chat.repository.ReactionRepository;
import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.team.repository.TeamMemberRepository;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final ReactionRepository reactionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(MessageRepository messageRepository,
                          ChannelRepository channelRepository,
                          TeamMemberRepository teamMemberRepository,
                          UserRepository userRepository,
                          ReactionRepository reactionRepository,
                          @Lazy SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.channelRepository = channelRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.reactionRepository = reactionRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, UUID senderId) {
        var channel = channelRepository.findById(request.channelId())
                .orElseThrow(() -> ApiException.notFound(ErrorCode.CHANNEL_NOT_FOUND, "Channel not found"));

        if (!teamMemberRepository.existsByTeamIdAndUserId(channel.getTeamId(), senderId)) {
            throw ApiException.forbidden(ErrorCode.ACCESS_DENIED, "You are not a member of this team");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.USER_NOT_FOUND, "User not found"));

        Message message = Message.builder()
                .channelId(request.channelId())
                .senderId(senderId)
                .content(request.content())
                .build();

        message = messageRepository.save(message);
        MessageResponse response = mapToResponse(message, sender, List.of());
        messagingTemplate.convertAndSend("/topic/channel/" + request.channelId(), response);
        return response;
    }

    @Transactional
    public MessageResponse editMessage(UUID messageId, String newContent, UUID requestingUserId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.MESSAGE_NOT_FOUND, "Message not found"));

        if (!message.getSenderId().equals(requestingUserId)) {
            throw ApiException.forbidden(ErrorCode.MESSAGE_EDIT_FORBIDDEN, "You can only edit your own messages");
        }

        message.setContent(newContent);
        message.setEditedAt(Instant.now());
        message = messageRepository.save(message);

        User sender = userRepository.findById(requestingUserId).orElse(null);
        List<Reaction> reactions = reactionRepository.findByMessageId(messageId);
        MessageResponse response = mapToResponse(message, sender, reactions);

        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannelId() + "/events",
                new ChannelEvent("MESSAGE_EDITED", response));
        return response;
    }

    @Transactional
    public void deleteMessage(UUID messageId, UUID requestingUserId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.MESSAGE_NOT_FOUND, "Message not found"));

        var channel = channelRepository.findById(message.getChannelId()).orElse(null);
        boolean isAdmin = channel != null &&
                teamMemberRepository.findByTeamIdAndUserId(channel.getTeamId(), requestingUserId)
                        .map(m -> m.getRole().name().equals("OWNER") || m.getRole().name().equals("ADMIN"))
                        .orElse(false);

        if (!message.getSenderId().equals(requestingUserId) && !isAdmin) {
            throw ApiException.forbidden(ErrorCode.MESSAGE_EDIT_FORBIDDEN, "You cannot delete this message");
        }

        message.setDeleted(true);
        messageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannelId() + "/events",
                new ChannelEvent("MESSAGE_DELETED", Map.of("messageId", messageId)));
    }

    @Transactional
    public List<ReactionSummary> addReaction(UUID messageId, String emoji, UUID userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.MESSAGE_NOT_FOUND, "Message not found"));

        if (!reactionRepository.existsByMessageIdAndUserIdAndEmoji(messageId, userId, emoji)) {
            Reaction reaction = Reaction.builder()
                    .messageId(messageId)
                    .userId(userId)
                    .emoji(emoji)
                    .build();
            reactionRepository.save(reaction);
        }

        List<Reaction> reactions = reactionRepository.findByMessageId(messageId);
        List<ReactionSummary> summaries = buildReactionSummaries(reactions);

        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannelId() + "/events",
                new ChannelEvent("REACTION_UPDATED", Map.of("messageId", messageId, "reactions", summaries)));
        return summaries;
    }

    @Transactional
    public List<ReactionSummary> removeReaction(UUID messageId, String emoji, UUID userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.MESSAGE_NOT_FOUND, "Message not found"));

        reactionRepository.deleteByMessageIdAndUserIdAndEmoji(messageId, userId, emoji);

        List<Reaction> reactions = reactionRepository.findByMessageId(messageId);
        List<ReactionSummary> summaries = buildReactionSummaries(reactions);

        messagingTemplate.convertAndSend("/topic/channel/" + message.getChannelId() + "/events",
                new ChannelEvent("REACTION_UPDATED", Map.of("messageId", messageId, "reactions", summaries)));
        return summaries;
    }

    public void broadcastTyping(TypingEvent event) {
        messagingTemplate.convertAndSend("/topic/channel/" + event.channelId() + "/typing", event);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(UUID channelId, UUID requestingUserId, int page, int size) {
        var channel = channelRepository.findById(channelId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.CHANNEL_NOT_FOUND, "Channel not found"));

        if (!teamMemberRepository.existsByTeamIdAndUserId(channel.getTeamId(), requestingUserId)) {
            throw ApiException.forbidden(ErrorCode.ACCESS_DENIED, "You are not a member of this team");
        }

        List<Message> messages = messageRepository
                .findByChannelIdAndDeletedFalseOrderByCreatedAtAsc(channelId, PageRequest.of(page, size))
                .getContent();

        if (messages.isEmpty()) return List.of();

        List<UUID> messageIds = messages.stream().map(Message::getId).collect(Collectors.toList());
        List<Reaction> allReactions = reactionRepository.findByMessageIdIn(messageIds);
        Map<UUID, List<Reaction>> reactionsByMessageId = allReactions.stream()
                .collect(Collectors.groupingBy(Reaction::getMessageId));

        return messages.stream().map(msg -> {
            User sender = userRepository.findById(msg.getSenderId()).orElse(null);
            List<Reaction> reactions = reactionsByMessageId.getOrDefault(msg.getId(), List.of());
            return mapToResponse(msg, sender, reactions);
        }).collect(Collectors.toList());
    }

    private List<ReactionSummary> buildReactionSummaries(List<Reaction> reactions) {
        Map<String, List<UUID>> grouped = new LinkedHashMap<>();
        for (Reaction r : reactions) {
            grouped.computeIfAbsent(r.getEmoji(), k -> new ArrayList<>()).add(r.getUserId());
        }
        return grouped.entrySet().stream()
                .map(e -> new ReactionSummary(e.getKey(), e.getValue().size(), e.getValue()))
                .collect(Collectors.toList());
    }

    private MessageResponse mapToResponse(Message message, User sender, List<Reaction> reactions) {
        return new MessageResponse(
                message.getId(),
                message.getChannelId(),
                message.getSenderId(),
                sender != null ? sender.getFirstName() : "Unknown",
                sender != null ? sender.getLastName() : "",
                message.getContent(),
                message.getEditedAt() != null,
                message.getEditedAt(),
                message.getCreatedAt(),
                buildReactionSummaries(reactions)
        );
    }
}

