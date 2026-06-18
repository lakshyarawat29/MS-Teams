package com.teamsclone.chat.service;

import com.teamsclone.chat.domain.Conversation;
import com.teamsclone.chat.domain.DirectMessage;
import com.teamsclone.chat.dto.ConversationResponse;
import com.teamsclone.chat.dto.DirectMessageResponse;
import com.teamsclone.chat.dto.SendDirectMessageRequest;
import com.teamsclone.chat.repository.ConversationRepository;
import com.teamsclone.chat.repository.DirectMessageRepository;
import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.notification.domain.NotificationType;
import com.teamsclone.notification.service.NotificationService;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DirectMessageService {

    private final ConversationRepository conversationRepository;
    private final DirectMessageRepository directMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public DirectMessageService(ConversationRepository conversationRepository,
                                DirectMessageRepository directMessageRepository,
                                UserRepository userRepository,
                                @Lazy SimpMessagingTemplate messagingTemplate,
                                @Lazy NotificationService notificationService) {
        this.conversationRepository = conversationRepository;
        this.directMessageRepository = directMessageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getMyConversations(UUID userId) {
        return conversationRepository.findByParticipantId(userId).stream()
                .map(conv -> {
                    UUID otherId = conv.getParticipant1Id().equals(userId)
                            ? conv.getParticipant2Id() : conv.getParticipant1Id();
                    User other = userRepository.findById(otherId).orElse(null);
                    return new ConversationResponse(
                            conv.getId(),
                            otherId,
                            other != null ? other.getFirstName() : "Unknown",
                            other != null ? other.getLastName() : "",
                            other != null ? other.getEmail() : "",
                            other != null ? other.getStatus().name() : "OFFLINE",
                            conv.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationResponse getOrCreateConversation(UUID currentUserId, UUID otherUserId) {
        userRepository.findById(otherUserId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.USER_NOT_FOUND, "User not found"));

        Conversation conv = conversationRepository.findByParticipants(currentUserId, otherUserId)
                .orElseGet(() -> {
                    // Store with lower UUID first for consistency
                    UUID p1 = currentUserId.compareTo(otherUserId) < 0 ? currentUserId : otherUserId;
                    UUID p2 = currentUserId.compareTo(otherUserId) < 0 ? otherUserId : currentUserId;
                    return conversationRepository.save(
                            Conversation.builder().participant1Id(p1).participant2Id(p2).build()
                    );
                });

        User other = userRepository.findById(otherUserId).orElseThrow();
        return new ConversationResponse(
                conv.getId(),
                otherUserId,
                other.getFirstName(),
                other.getLastName(),
                other.getEmail(),
                other.getStatus().name(),
                conv.getCreatedAt()
        );
    }

    @Transactional
    public DirectMessageResponse sendMessage(UUID senderId, SendDirectMessageRequest request) {
        User recipient = userRepository.findById(request.recipientId())
                .orElseThrow(() -> ApiException.notFound(ErrorCode.USER_NOT_FOUND, "Recipient not found"));

        Conversation conv = conversationRepository.findByParticipants(senderId, request.recipientId())
                .orElseGet(() -> {
                    UUID p1 = senderId.compareTo(request.recipientId()) < 0 ? senderId : request.recipientId();
                    UUID p2 = senderId.compareTo(request.recipientId()) < 0 ? request.recipientId() : senderId;
                    return conversationRepository.save(
                            Conversation.builder().participant1Id(p1).participant2Id(p2).build()
                    );
                });

        User sender = userRepository.findById(senderId).orElseThrow();

        DirectMessage dm = DirectMessage.builder()
                .conversationId(conv.getId())
                .senderId(senderId)
                .content(request.content())
                .build();
        dm = directMessageRepository.save(dm);

        DirectMessageResponse response = mapToResponse(dm, sender);
        messagingTemplate.convertAndSend("/topic/dm/" + conv.getId(), response);

        // Notify recipient
        notificationService.createNotification(
                request.recipientId(),
                NotificationType.DIRECT_MESSAGE,
                sender.getFirstName() + " " + sender.getLastName(),
                request.content(),
                conv.getId()
        );

        return response;
    }

    @Transactional(readOnly = true)
    public List<DirectMessageResponse> getMessages(UUID conversationId, UUID requestingUserId,
                                                    int page, int size) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.CONVERSATION_NOT_FOUND, "Conversation not found"));

        if (!conv.getParticipant1Id().equals(requestingUserId) &&
                !conv.getParticipant2Id().equals(requestingUserId)) {
            throw ApiException.forbidden(ErrorCode.ACCESS_DENIED, "Not a participant in this conversation");
        }

        return directMessageRepository
                .findByConversationIdAndDeletedFalseOrderByCreatedAtAsc(conversationId, PageRequest.of(page, size))
                .stream()
                .map(dm -> {
                    User sender = userRepository.findById(dm.getSenderId()).orElse(null);
                    return mapToResponse(dm, sender);
                })
                .collect(Collectors.toList());
    }

    private DirectMessageResponse mapToResponse(DirectMessage dm, User sender) {
        return new DirectMessageResponse(
                dm.getId(),
                dm.getConversationId(),
                dm.getSenderId(),
                sender != null ? sender.getFirstName() : "Unknown",
                sender != null ? sender.getLastName() : "",
                dm.getContent(),
                dm.getEditedAt() != null,
                dm.getEditedAt(),
                dm.getCreatedAt()
        );
    }
}
