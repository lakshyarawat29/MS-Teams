# Teams Clone - System Design

## Overview

A production-grade collaboration platform inspired by Microsoft Teams.

Primary capabilities:

* Multi-Tenant Organizations
* Teams
* Channels
* Direct Messaging
* Group Messaging
* Presence Tracking
* Notifications
* File Sharing
* Meeting Scheduling
* Search

Architecture style:

* Microservices
* Event Driven
* Domain Driven Design
* Hexagonal Architecture

---

# High Level Architecture

```text
                       Internet
                           |
                           v
                   API Gateway
                           |
     ------------------------------------------------
     |       |        |        |        |           |
     v       v        v        v        v           v

  Auth    User     Team     Chat    Meeting      File
Service Service  Service  Service  Service    Service

     |       |        |        |        |           |
     -----------------------------------------------
                           |
                           v
                         Kafka
                           |
          -----------------------------------
          |                 |               |
          v                 v               v
 Notification       Search Service    Analytics
    Service

                           |
                           v
                         Redis
```

---

# Services

## Auth Service

Purpose:

Authentication and authorization.

Responsibilities:

* Register users
* Login
* Refresh tokens
* Password reset
* JWT generation

Database:

auth_db

Communication:

REST

Events Produced:

USER_REGISTERED

---

## User Service

Purpose:

User profile management.

Responsibilities:

* Profile information
* Avatar management
* User settings

Database:

user_db

Events Produced:

USER_PROFILE_UPDATED

---

## Team Service

Purpose:

Team and channel management.

Responsibilities:

* Create team
* Create channel
* Manage members

Database:

team_db

Events Produced:

TEAM_CREATED
CHANNEL_CREATED
MEMBER_ADDED

---

## Chat Service

Purpose:

Real-time communication.

Responsibilities:

* Direct messaging
* Channel messaging
* Message reactions
* Read receipts

Database:

chat_db

Realtime:

WebSocket

Events Produced:

MESSAGE_SENT
MESSAGE_READ
MESSAGE_REACTED

---

## Presence Service

Purpose:

Track user availability.

Storage:

Redis

States:

ONLINE
OFFLINE
AWAY
BUSY

---

## Notification Service

Purpose:

Deliver notifications.

Responsibilities:

* Mentions
* Team invitations
* Message notifications

Consumes:

MESSAGE_SENT
MEMBER_ADDED
MEETING_CREATED

---

## Meeting Service

Purpose:

Meeting scheduling.

Responsibilities:

* Create meeting
* Invite participants

Database:

meeting_db

Events Produced:

MEETING_CREATED

---

## File Service

Purpose:

File management.

Responsibilities:

* Upload file
* Download file
* Share file

Storage:

MinIO

Database:

file_db

Events Produced:

FILE_UPLOADED

---

## Search Service

Purpose:

Global search.

Responsibilities:

* Search messages
* Search users
* Search channels

Storage:

Elasticsearch

Consumes:

MESSAGE_SENT
USER_PROFILE_UPDATED
CHANNEL_CREATED

---

# Communication Strategy

## Synchronous

Protocol:

REST

Used For:

* User profile lookup
* Authentication validation
* Team information retrieval

Technology:

OpenFeign

---

## Asynchronous

Protocol:

Kafka

Used For:

* Notifications
* Search indexing
* Audit events

Topics:

user-events
team-events
chat-events
meeting-events
file-events

---

## Realtime

Protocol:

WebSocket + STOMP

Used For:

* Messaging
* Typing indicators
* Presence updates

---

# API Gateway

Responsibilities:

* Routing
* Authentication
* Rate limiting
* Request logging

Technology:

Spring Cloud Gateway

---

# Service Discovery

Technology:

Eureka

Responsibilities:

* Service registration
* Service lookup

---

# Configuration Management

Technology:

Spring Cloud Config

Responsibilities:

* Centralized configuration
* Environment management

---

# Redis Strategy

Uses:

1. User Presence
2. Session Cache
3. Team Cache
4. User Cache
5. Message Cache

Example Keys:

presence:user:101

user:101

team:55

---

# Kafka Strategy

Topic Naming Convention

<domain>-events

Examples

user-events

chat-events

meeting-events

---

# Security Architecture

Authentication:

JWT

Authorization:

RBAC

Roles:

OWNER
ADMIN
MEMBER
GUEST

Password Encryption:

BCrypt

Token Expiration:

15 Minutes

Refresh Token:

7 Days

---

# Observability

Metrics:

Prometheus

Dashboards:

Grafana

Tracing:

Zipkin

Logging:

Structured JSON Logs

Correlation IDs:

Required

---

# Scalability

Chat Service:

Horizontal Scaling

Redis PubSub

Load Balancer

Notification Service:

Multiple Consumers

Kafka Consumer Groups

Search Service:

Independent Scaling

---

# Future Enhancements

Phase 2

* Video Calling
* Voice Calling
* Screen Sharing

Phase 3

* AI Meeting Summary
* AI Chat Assistant
* AI Search

Phase 4

* Kubernetes Deployment
* Multi Region Support
