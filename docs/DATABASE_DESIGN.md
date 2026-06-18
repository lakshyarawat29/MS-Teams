# Teams Clone - Database Design

## Database Strategy

Database Per Service Pattern

Services:

auth_db
user_db
team_db
chat_db
meeting_db
file_db

---

# AUTH_DB

## user_credentials

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| email         | VARCHAR   |
| password_hash | VARCHAR   |
| is_active     | BOOLEAN   |
| created_at    | TIMESTAMP |
| updated_at    | TIMESTAMP |

---

## refresh_tokens

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| token      | VARCHAR   |
| expires_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

# USER_DB

## users

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| first_name | VARCHAR   |
| last_name  | VARCHAR   |
| email      | VARCHAR   |
| avatar_url | VARCHAR   |
| bio        | TEXT      |
| created_at | TIMESTAMP |

---

## user_settings

| Column               | Type    |
| -------------------- | ------- |
| id                   | UUID    |
| user_id              | UUID    |
| theme                | VARCHAR |
| notification_enabled | BOOLEAN |
| timezone             | VARCHAR |

---

# TEAM_DB

## teams

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| name        | VARCHAR   |
| description | TEXT      |
| owner_id    | UUID      |
| created_at  | TIMESTAMP |

---

## channels

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| team_id     | UUID      |
| name        | VARCHAR   |
| description | TEXT      |
| created_at  | TIMESTAMP |

---

## team_members

| Column    | Type      |
| --------- | --------- |
| id        | UUID      |
| team_id   | UUID      |
| user_id   | UUID      |
| role      | VARCHAR   |
| joined_at | TIMESTAMP |

---

# CHAT_DB

## conversations

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| type       | VARCHAR   |
| created_at | TIMESTAMP |

type values:

DIRECT
GROUP
CHANNEL

---

## conversation_members

| Column          | Type |
| --------------- | ---- |
| id              | UUID |
| conversation_id | UUID |
| user_id         | UUID |

---

## messages

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| conversation_id | UUID      |
| sender_id       | UUID      |
| content         | TEXT      |
| created_at      | TIMESTAMP |
| updated_at      | TIMESTAMP |
| deleted         | BOOLEAN   |

Indexes:

conversation_id

sender_id

created_at

---

## message_reads

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| message_id | UUID      |
| user_id    | UUID      |
| read_at    | TIMESTAMP |

---

## reactions

| Column     | Type    |
| ---------- | ------- |
| id         | UUID    |
| message_id | UUID    |
| user_id    | UUID    |
| emoji      | VARCHAR |

---

# FILE_DB

## file_metadata

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| file_name   | VARCHAR   |
| file_url    | VARCHAR   |
| uploaded_by | UUID      |
| size_bytes  | BIGINT    |
| created_at  | TIMESTAMP |

---

## file_permissions

| Column     | Type    |
| ---------- | ------- |
| id         | UUID    |
| file_id    | UUID    |
| user_id    | UUID    |
| permission | VARCHAR |

permission:

VIEW
EDIT

---

# MEETING_DB

## meetings

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| title        | VARCHAR   |
| description  | TEXT      |
| organizer_id | UUID      |
| start_time   | TIMESTAMP |
| end_time     | TIMESTAMP |

---

## meeting_participants

| Column     | Type    |
| ---------- | ------- |
| id         | UUID    |
| meeting_id | UUID    |
| user_id    | UUID    |
| status     | VARCHAR |

status:

PENDING
ACCEPTED
DECLINED

---

# Relationships

Team

1 → N Channels

Team

1 → N Members

Conversation

1 → N Messages

Message

1 → N Reactions

Message

1 → N ReadReceipts

Meeting

1 → N Participants

File

1 → N Permissions

---

# Indexing Strategy

Messages:

(conversation_id, created_at)

Users:

(email)

Teams:

(owner_id)

Channels:

(team_id)

Meetings:

(start_time)

---

# Audit Columns

Every table should include:

created_at

updated_at

created_by

updated_by

Soft Delete:

deleted_at

deleted_by

where applicable.
