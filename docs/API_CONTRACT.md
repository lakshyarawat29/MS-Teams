# 04_API_CONTRACTS.md

# Teams Clone - API Contracts

Version: v1

Base URL:

```text
/api/v1
```

Authentication:

```http
Authorization: Bearer <jwt-token>
```

Content-Type:

```http
application/json
```

---

# Common Response Format

## Success Response

```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-06-18T10:00:00Z"
}
```

---

## Error Response

```json
{
  "success": false,
  "errorCode": "USER_NOT_FOUND",
  "message": "User not found",
  "timestamp": "2026-06-18T10:00:00Z"
}
```

---

# AUTH SERVICE

Base Path:

```text
/api/v1/auth
```

---

## Register User

### Endpoint

```http
POST /auth/register
```

### Request

```json
{
  "firstName": "Lakshya",
  "lastName": "Rawat",
  "email": "lakshya@email.com",
  "password": "StrongPassword123"
}
```

### Response

```json
{
  "userId": "uuid",
  "email": "lakshya@email.com"
}
```

---

## Login

### Endpoint

```http
POST /auth/login
```

### Request

```json
{
  "email": "lakshya@email.com",
  "password": "StrongPassword123"
}
```

### Response

```json
{
  "accessToken": "jwt",
  "refreshToken": "refresh-token",
  "expiresIn": 900
}
```

---

## Refresh Token

### Endpoint

```http
POST /auth/refresh
```

### Request

```json
{
  "refreshToken": "refresh-token"
}
```

### Response

```json
{
  "accessToken": "new-jwt",
  "expiresIn": 900
}
```

---

## Logout

### Endpoint

```http
POST /auth/logout
```

### Response

```json
{
  "message": "Logged out successfully"
}
```

---

# USER SERVICE

Base Path

```text
/api/v1/users
```

---

## Get Current User

### Endpoint

```http
GET /users/me
```

### Response

```json
{
  "id": "uuid",
  "firstName": "Lakshya",
  "lastName": "Rawat",
  "email": "lakshya@email.com",
  "avatarUrl": "https://..."
}
```

---

## Get User By ID

### Endpoint

```http
GET /users/{userId}
```

### Response

```json
{
  "id": "uuid",
  "firstName": "Lakshya",
  "lastName": "Rawat"
}
```

---

## Update Profile

### Endpoint

```http
PUT /users/me
```

### Request

```json
{
  "firstName": "Lakshya",
  "lastName": "Rawat",
  "bio": "Software Engineer"
}
```

### Response

```json
{
  "message": "Profile updated"
}
```

---

## Upload Avatar

### Endpoint

```http
POST /users/me/avatar
```

### Request

Multipart Form Data

```text
file=image.png
```

### Response

```json
{
  "avatarUrl": "https://..."
}
```

---

# TEAM SERVICE

Base Path

```text
/api/v1/teams
```

---

## Create Team

### Endpoint

```http
POST /teams
```

### Request

```json
{
  "name": "Backend Team",
  "description": "Platform Engineering Team"
}
```

### Response

```json
{
  "teamId": "uuid"
}
```

---

## Get Team

### Endpoint

```http
GET /teams/{teamId}
```

---

## Update Team

### Endpoint

```http
PUT /teams/{teamId}
```

---

## Delete Team

### Endpoint

```http
DELETE /teams/{teamId}
```

---

## Add Member

### Endpoint

```http
POST /teams/{teamId}/members
```

### Request

```json
{
  "userId": "uuid",
  "role": "MEMBER"
}
```

---

## Remove Member

### Endpoint

```http
DELETE /teams/{teamId}/members/{userId}
```

---

## List Members

### Endpoint

```http
GET /teams/{teamId}/members
```

---

# CHANNEL SERVICE

Base Path

```text
/api/v1/channels
```

---

## Create Channel

### Endpoint

```http
POST /channels
```

### Request

```json
{
  "teamId": "uuid",
  "name": "general"
}
```

### Response

```json
{
  "channelId": "uuid"
}
```

---

## Get Channel

### Endpoint

```http
GET /channels/{channelId}
```

---

## Delete Channel

### Endpoint

```http
DELETE /channels/{channelId}
```

---

## List Team Channels

### Endpoint

```http
GET /teams/{teamId}/channels
```

---

# CHAT SERVICE

Base Path

```text
/api/v1/chat
```

---

## Create Direct Conversation

### Endpoint

```http
POST /chat/conversations/direct
```

### Request

```json
{
  "recipientId": "uuid"
}
```

### Response

```json
{
  "conversationId": "uuid"
}
```

---

## Create Group Conversation

### Endpoint

```http
POST /chat/conversations/group
```

### Request

```json
{
  "name": "Platform Team",
  "memberIds": [
    "uuid1",
    "uuid2"
  ]
}
```

---

## Get Conversations

### Endpoint

```http
GET /chat/conversations
```

---

## Send Message

### Endpoint

```http
POST /chat/messages
```

### Request

```json
{
  "conversationId": "uuid",
  "content": "Hello team"
}
```

### Response

```json
{
  "messageId": "uuid"
}
```

---

## Get Messages

### Endpoint

```http
GET /chat/conversations/{conversationId}/messages
```

Query Parameters

```text
page
size
```

---

## Edit Message

### Endpoint

```http
PUT /chat/messages/{messageId}
```

### Request

```json
{
  "content": "Updated message"
}
```

---

## Delete Message

### Endpoint

```http
DELETE /chat/messages/{messageId}
```

---

## Mark As Read

### Endpoint

```http
POST /chat/messages/{messageId}/read
```

---

## Add Reaction

### Endpoint

```http
POST /chat/messages/{messageId}/reactions
```

### Request

```json
{
  "emoji": "👍"
}
```

---

# PRESENCE SERVICE

Base Path

```text
/api/v1/presence
```

---

## Update Status

### Endpoint

```http
PUT /presence/status
```

### Request

```json
{
  "status": "ONLINE"
}
```

Allowed Values

```text
ONLINE
OFFLINE
BUSY
AWAY
```

---

## Get User Status

### Endpoint

```http
GET /presence/users/{userId}
```

### Response

```json
{
  "status": "ONLINE",
  "lastSeen": "2026-06-18T10:00:00Z"
}
```

---

# FILE SERVICE

Base Path

```text
/api/v1/files
```

---

## Upload File

### Endpoint

```http
POST /files/upload
```

Multipart Request

```text
file=document.pdf
```

### Response

```json
{
  "fileId": "uuid",
  "fileUrl": "https://..."
}
```

---

## Download File

### Endpoint

```http
GET /files/{fileId}
```

---

## Delete File

### Endpoint

```http
DELETE /files/{fileId}
```

---

## Share File

### Endpoint

```http
POST /files/{fileId}/share
```

### Request

```json
{
  "userId": "uuid",
  "permission": "VIEW"
}
```

---

# MEETING SERVICE

Base Path

```text
/api/v1/meetings
```

---

## Schedule Meeting

### Endpoint

```http
POST /meetings
```

### Request

```json
{
  "title": "Sprint Planning",
  "description": "Sprint 5 Planning",
  "startTime": "2026-06-20T10:00:00Z",
  "endTime": "2026-06-20T11:00:00Z"
}
```

### Response

```json
{
  "meetingId": "uuid"
}
```

---

## Get Meeting

### Endpoint

```http
GET /meetings/{meetingId}
```

---

## Cancel Meeting

### Endpoint

```http
DELETE /meetings/{meetingId}
```

---

## Add Participant

### Endpoint

```http
POST /meetings/{meetingId}/participants
```

### Request

```json
{
  "userId": "uuid"
}
```

---

## Update RSVP

### Endpoint

```http
PUT /meetings/{meetingId}/participants/me
```

### Request

```json
{
  "status": "ACCEPTED"
}
```

---

# NOTIFICATION SERVICE

Base Path

```text
/api/v1/notifications
```

---

## Get Notifications

### Endpoint

```http
GET /notifications
```

Query Params

```text
page
size
```

---

## Mark Notification Read

### Endpoint

```http
PUT /notifications/{notificationId}/read
```

---

## Mark All Read

### Endpoint

```http
PUT /notifications/read-all
```

---

# SEARCH SERVICE

Base Path

```text
/api/v1/search
```

---

## Global Search

### Endpoint

```http
GET /search
```

Query Parameters

```text
query
type
page
size
```

Types

```text
USER
TEAM
CHANNEL
MESSAGE
FILE
```

### Example

```http
GET /search?query=sprint&type=MESSAGE
```

### Response

```json
{
  "results": []
}
```

---

# WebSocket Contracts

## Connection Endpoint

```text
/ws
```

---

## Send Message

Client Destination

```text
/app/chat.send
```

---

## Receive Message

Topic

```text
/topic/conversation/{conversationId}
```

---

## Presence Updates

Topic

```text
/topic/presence
```

---

## Typing Indicator

Topic

```text
/topic/typing/{conversationId}
```

Payload

```json
{
  "userId": "uuid",
  "typing": true
}
```
