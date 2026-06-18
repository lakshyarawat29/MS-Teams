# Teams Clone — What's Left To Do

Current state: **MVP monolith running locally** on H2 in-memory DB + Vite dev server.
Everything below is what remains before this is production-ready.

---

## 1. Database — Switch from H2 to PostgreSQL

The production `application.yml` already targets PostgreSQL and Flyway is configured.
H2 is only used in the `local` profile.

### Steps

1. Install PostgreSQL locally (or spin up via Docker):
   ```bash
   docker run -d --name pg-teams -e POSTGRES_DB=teamsclone -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
   ```

2. The existing Flyway migrations (`V1` – `V10`) cover:
   - users, teams, team_members, channels, messages, message_reactions
   - refresh_tokens, conversations, notifications
   - user status column

3. **Missing Flyway migrations** — need to add:

   | File | Table |
   |------|-------|
   | `V11__create_file_metadata.sql` | `file_metadata` (uploaded files) |
   | `V12__create_meetings.sql` | `meetings` + `meeting_participants` |

   These tables exist as JPA entities but have no SQL migration yet. Hibernate auto-creates them in H2 via `ddl-auto: create-drop`, but `validate` mode (production) will fail without the migrations.

4. Run without the `local` profile to use PostgreSQL:
   ```bash
   mvn spring-boot:run
   ```
   (No `-Dspring-boot.run.profiles=local`)

---

## 2. File Storage — Switch from Local Disk to S3 / MinIO

Currently `FileService` saves uploads to a local `uploads/` folder.
This breaks on any multi-instance or cloud deployment.

### Steps

1. Add the AWS S3 SDK dependency to `pom.xml`:
   ```xml
   <dependency>
     <groupId>software.amazon.awssdk</groupId>
     <artifactId>s3</artifactId>
   </dependency>
   ```

2. Replace `FileService` disk logic with `S3Client.putObject()` / `presignedUrl`.

3. For local dev, run **MinIO** (S3-compatible):
   ```bash
   docker run -d -p 9000:9000 -p 9001:9001 --name minio \
     -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
     minio/minio server /data --console-address ":9001"
   ```

4. Add config:
   ```yaml
   app:
     storage:
       type: s3          # or local
       bucket: teams-files
       endpoint: http://localhost:9000   # MinIO local
       access-key: ${AWS_ACCESS_KEY}
       secret-key: ${AWS_SECRET_KEY}
   ```

---

## 3. Frontend Fixes Still Needed

### 3a. LeftRail — activeSection not synced with URL
When you open a direct URL (e.g. `/channel/xxx`), `activeSection` in `uiStore` stays at `'teams'` and the Sidebar shows the Teams panel instead of Chat. Need to call `setActiveSection` based on `useLocation()` inside `MainLayout`.

### 3b. TeamPage — clicking a channel doesn't navigate
`TeamPage` lists channels but the list items don't call `navigate('/channel/:id')`. Needs an `onClick` handler on each channel row.

### 3c. SearchPage — results are not clickable
Clicking a message result should navigate to `/channel/:channelId`, a channel result to `/channel/:channelId`, and a user result to open a DM. Currently nothing happens on click.

### 3d. Settings icon in LeftRail does nothing
The gear icon at the bottom of `LeftRail` has no `onClick`. Should navigate to `/profile`.

### 3e. DMPage doesn't use real-time DM WebSocket
`DMPage` loads messages via REST but does not subscribe to `/topic/dm/:conversationId` for live updates. `useRealtime.ts` exports `useDMWebSocket` — it just needs to be called inside `DMPage`.

### 3f. File messages — content vs. URL
When a file is uploaded in `MessageInput`, the file URL is sent as the message content string. `MessageList` detects it via `content.startsWith('/api/v1/files/')`. This works but is fragile. A proper `attachmentUrl` field on the `Message` entity would be cleaner (post-MVP improvement).

---

## 4. Missing Backend Features

### 4a. Group DMs / multi-person conversations
Currently `Conversation` only has `participant1Id` + `participant2Id` (1:1 DMs). The master plan mentions group messaging. Needs a `ConversationParticipant` join table.

### 4b. @Mention support
No mention parsing in messages. Notifications of type `MENTION` exist in the enum but are never triggered. Frontend doesn't highlight `@username` text.

### 4c. Message read receipts / unread counts
No `read_at` tracking. Sidebar shows no unread badges. Needs a `MessageRead` table and a count query per channel per user.

### 4d. Audit logs
Master plan calls for audit logging. No `AuditLog` entity or service exists.

### 4e. Pagination cursor on messages
`MessageRepository` uses `Page<Message>` (offset pagination). For large channels, cursor-based pagination (by `createdAt`) is more efficient.

---

## 5. Auth Improvements

| Item | Status |
|------|--------|
| Email verification on register | ❌ Not implemented |
| Password reset / forgot password | ❌ Not implemented |
| OAuth2 (Google / Microsoft login) | ❌ Not implemented |
| Refresh token rotation (single-use) | ⚠️ Tokens reuse same value |
| Rate limiting on `/auth/**` | ❌ Not implemented |

---

## 6. Docker / Local Full Stack

A `docker-compose.yml` doesn't exist yet. The full local stack should be:

```yaml
# docker-compose.yml (to create)
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: teamsclone
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]

  backend:
    build: ./backend
    depends_on: [postgres, minio]
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/teamsclone
      JWT_SECRET: changeme
    ports: ["8080:8080"]

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]
```

---

## 7. Cloud Deployment (Azure / AWS / GCP)

### Minimum viable cloud setup

| Component | Service |
|-----------|---------|
| Backend (Spring Boot) | Azure App Service or AWS Elastic Beanstalk or a VM |
| Frontend (React static) | Azure Static Web Apps / AWS S3 + CloudFront / Vercel |
| Database | Azure Database for PostgreSQL / AWS RDS PostgreSQL |
| File storage | Azure Blob Storage / AWS S3 |
| WebSocket | Sticky sessions or use Azure SignalR / AWS ALB |

### Environment variables needed in prod

```
DB_URL=jdbc:postgresql://<host>:5432/teamsclone
DB_USERNAME=<user>
DB_PASSWORD=<password>
JWT_SECRET=<256-bit random string>
JWT_EXPIRATION=900000
REFRESH_EXPIRATION=604800000
SERVER_PORT=8080
AWS_ACCESS_KEY=<key>          # or Azure storage connection string
AWS_SECRET_KEY=<secret>
S3_BUCKET=teams-files
STORAGE_ENDPOINT=https://...  # omit for real AWS S3
```

### Build for production

```bash
# Backend — build fat JAR
mvn -f backend/pom.xml clean package -DskipTests
# produces: backend/target/teams-clone-backend-0.0.1-SNAPSHOT.jar

# Frontend — build static assets
cd frontend && npm run build
# produces: frontend/dist/
```

---

## 8. Observability / Monitoring (not started)

Actuator endpoints are exposed (`/actuator/health`, `/actuator/info`).
Everything else below is not set up:

- [ ] Prometheus scrape endpoint (`/actuator/prometheus`) — add `micrometer-registry-prometheus` dep
- [ ] Grafana dashboard
- [ ] Distributed tracing — Zipkin / OpenTelemetry
- [ ] Structured logging (JSON) — add `logstash-logback-encoder`
- [ ] Error tracking — Sentry SDK

---

## 9. Testing Gaps

| Area | Current | Target |
|------|---------|--------|
| Unit tests | AuthService, TeamService, ChannelService, MessageService | All services |
| Integration tests | None | Testcontainers + PostgreSQL |
| E2E tests | None | Playwright |
| Frontend unit tests | None | Vitest + Testing Library |
| Load tests | None | k6 or Gatling |

---

## 10. Security Hardening

- [ ] HTTPS / TLS termination (reverse proxy like nginx or cloud LB)
- [ ] JWT secret must be ≥ 256 bits — current local secret is fine, **prod secret must be rotated and stored in a vault**
- [ ] `h2-console` must be disabled in production (it's behind the `local` profile — confirm it's not active in prod)
- [ ] CORS `allowedOrigins` is currently `*` in `CorsConfig` — restrict to your actual domain in prod
- [ ] File upload: validate MIME type server-side, set max size (currently 25 MB)
- [ ] Add `Content-Security-Policy` headers

---

## Quick Priority Order

```
Phase 1 — Make it fully work locally
  1. Add V11 + V12 Flyway migrations
  2. Fix frontend routing issues (3a–3e above)
  3. Switch to PostgreSQL locally
  4. Create docker-compose.yml

Phase 2 — Production ready
  5. Switch file storage to S3 / MinIO
  6. Build Docker images + Dockerfile for backend and frontend
  7. Deploy to cloud (pick one provider)
  8. Set env vars, enable HTTPS

Phase 3 — Complete features
  9. Email verification + password reset
  10. @Mentions + unread counts
  11. Observability stack
  12. E2E tests
```
