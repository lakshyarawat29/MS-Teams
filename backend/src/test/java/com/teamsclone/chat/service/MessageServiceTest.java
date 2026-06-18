package com.teamsclone.chat.service;

import com.teamsclone.channel.domain.Channel;
import com.teamsclone.channel.repository.ChannelRepository;
import com.teamsclone.chat.domain.Message;
import com.teamsclone.chat.dto.MessageResponse;
import com.teamsclone.chat.dto.SendMessageRequest;
import com.teamsclone.chat.repository.MessageRepository;
import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.team.repository.TeamMemberRepository;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.domain.UserRole;
import com.teamsclone.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MessageService Unit Tests")
class MessageServiceTest {

    @Mock private MessageRepository messageRepository;
    @Mock private ChannelRepository channelRepository;
    @Mock private TeamMemberRepository teamMemberRepository;
    @Mock private UserRepository userRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MessageService messageService;

    @Test
    @DisplayName("sendMessage: valid request, should persist and broadcast message")
    void sendMessage_validRequest_persistsAndBroadcasts() {
        UUID channelId = UUID.randomUUID();
        UUID senderId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        SendMessageRequest request = new SendMessageRequest(channelId, "Hello team!");
        Channel channel = buildChannel(channelId, teamId);
        User sender = buildUser(senderId);
        Message saved = buildMessage(channelId, senderId, "Hello team!");

        when(channelRepository.findById(channelId)).thenReturn(Optional.of(channel));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, senderId)).thenReturn(true);
        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(messageRepository.save(any(Message.class))).thenReturn(saved);

        MessageResponse response = messageService.sendMessage(request, senderId);

        assertThat(response.content()).isEqualTo("Hello team!");
        assertThat(response.senderId()).isEqualTo(senderId);
        verify(messagingTemplate).convertAndSend(
                eq("/topic/channel/" + channelId),
                any(MessageResponse.class)
        );
    }

    @Test
    @DisplayName("sendMessage: when not team member, should throw forbidden")
    void sendMessage_notTeamMember_throwsForbidden() {
        UUID channelId = UUID.randomUUID();
        UUID senderId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        SendMessageRequest request = new SendMessageRequest(channelId, "Hello!");

        when(channelRepository.findById(channelId)).thenReturn(Optional.of(buildChannel(channelId, teamId)));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, senderId)).thenReturn(false);

        assertThatThrownBy(() -> messageService.sendMessage(request, senderId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    assertThat(((ApiException) ex).getErrorCode()).isEqualTo(ErrorCode.ACCESS_DENIED);
                });

        verify(messageRepository, never()).save(any());
    }

    @Test
    @DisplayName("getMessages: valid channel, should return paginated messages")
    void getMessages_validChannel_returnsPaginatedMessages() {
        UUID channelId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        List<Message> messages = List.of(buildMessage(channelId, userId, "msg1"));

        when(channelRepository.findById(channelId)).thenReturn(Optional.of(buildChannel(channelId, teamId)));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(true);
        when(messageRepository.findByChannelIdAndDeletedFalseOrderByCreatedAtAsc(
                eq(channelId), any(Pageable.class)
        )).thenReturn(new PageImpl<>(messages));
        when(userRepository.findById(userId)).thenReturn(Optional.of(buildUser(userId)));

        List<MessageResponse> result = messageService.getMessages(channelId, userId, 0, 50);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).content()).isEqualTo("msg1");
    }

    private Channel buildChannel(UUID channelId, UUID teamId) {
        return Channel.builder()
                .id(channelId)
                .teamId(teamId)
                .name("general")
                .createdBy(UUID.randomUUID())
                .createdAt(Instant.now())
                .build();
    }

    private User buildUser(UUID userId) {
        return User.builder()
                .id(userId)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@test.com")
                .passwordHash("hash")
                .role(UserRole.USER)
                .build();
    }

    private Message buildMessage(UUID channelId, UUID senderId, String content) {
        return Message.builder()
                .id(UUID.randomUUID())
                .channelId(channelId)
                .senderId(senderId)
                .content(content)
                .createdAt(Instant.now())
                .build();
    }
}
