package com.teamsclone.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration using STOMP over SockJS.
 *
 * Flow for realtime messages:
 *   1. Client subscribes to /topic/channel/{channelId}
 *   2. User sends REST POST /api/v1/messages (authenticated via JWT)
 *   3. MessageService persists message and broadcasts to /topic/channel/{channelId}
 *   4. All subscribed clients receive the message instantly
 *
 * This is intentionally simple for MVP. WebSocket-level authentication
 * (CONNECT frame JWT validation) can be added in the production hardening sprint.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
