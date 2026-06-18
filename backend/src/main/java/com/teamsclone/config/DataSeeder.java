package com.teamsclone.config;

import com.teamsclone.channel.domain.Channel;
import com.teamsclone.channel.repository.ChannelRepository;
import com.teamsclone.chat.domain.Conversation;
import com.teamsclone.chat.domain.DirectMessage;
import com.teamsclone.chat.domain.Message;
import com.teamsclone.chat.repository.ConversationRepository;
import com.teamsclone.chat.repository.DirectMessageRepository;
import com.teamsclone.chat.repository.MessageRepository;
import com.teamsclone.team.domain.Team;
import com.teamsclone.team.domain.TeamMember;
import com.teamsclone.team.domain.TeamRole;
import com.teamsclone.team.repository.TeamMemberRepository;
import com.teamsclone.team.repository.TeamRepository;
import com.teamsclone.user.domain.User;
import com.teamsclone.user.domain.UserRole;
import com.teamsclone.user.domain.UserStatus;
import com.teamsclone.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ChannelRepository channelRepository;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final DirectMessageRepository directMessageRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-data:false}")
    private boolean seedEnabled;

    public DataSeeder(UserRepository userRepository,
                      TeamRepository teamRepository,
                      TeamMemberRepository teamMemberRepository,
                      ChannelRepository channelRepository,
                      MessageRepository messageRepository,
                      ConversationRepository conversationRepository,
                      DirectMessageRepository directMessageRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.channelRepository = channelRepository;
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.directMessageRepository = directMessageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!seedEnabled) return;
        if (userRepository.count() > 0) {
            log.info("DataSeeder: data already present, skipping seed.");
            return;
        }

        log.info("DataSeeder: seeding demo data...");

        // ── Users ────────────────────────────────────────────────
        User alice = userRepository.save(User.builder()
                .firstName("Alice").lastName("Johnson")
                .email("alice@demo.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRole.USER).status(UserStatus.ONLINE).active(true)
                .build());

        User bob = userRepository.save(User.builder()
                .firstName("Bob").lastName("Smith")
                .email("bob@demo.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRole.USER).status(UserStatus.ONLINE).active(true)
                .build());

        User carol = userRepository.save(User.builder()
                .firstName("Carol").lastName("Williams")
                .email("carol@demo.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRole.USER).status(UserStatus.AWAY).active(true)
                .build());

        User dave = userRepository.save(User.builder()
                .firstName("Dave").lastName("Brown")
                .email("dave@demo.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRole.ADMIN).status(UserStatus.OFFLINE).active(true)
                .build());

        // ── Team: Engineering ────────────────────────────────────
        Team eng = teamRepository.save(Team.builder()
                .name("Engineering")
                .description("Backend, frontend and infrastructure engineers")
                .ownerId(alice.getId())
                .build());

        teamMemberRepository.save(TeamMember.builder().teamId(eng.getId()).userId(alice.getId()).role(TeamRole.OWNER).build());
        teamMemberRepository.save(TeamMember.builder().teamId(eng.getId()).userId(bob.getId()).role(TeamRole.MEMBER).build());
        teamMemberRepository.save(TeamMember.builder().teamId(eng.getId()).userId(carol.getId()).role(TeamRole.MEMBER).build());

        // Channels in Engineering
        Channel general = channelRepository.save(Channel.builder()
                .teamId(eng.getId()).name("general")
                .description("General announcements for the engineering team")
                .createdBy(alice.getId()).build());

        Channel backend = channelRepository.save(Channel.builder()
                .teamId(eng.getId()).name("backend")
                .description("Spring Boot, APIs, databases")
                .createdBy(alice.getId()).build());

        Channel frontend = channelRepository.save(Channel.builder()
                .teamId(eng.getId()).name("frontend")
                .description("React, TypeScript, UI/UX")
                .createdBy(bob.getId()).build());

        // Messages in #general
        saveMsg(general.getId(), alice.getId(), "Hey team! Welcome to the Engineering channel 👋");
        saveMsg(general.getId(), bob.getId(), "Thanks Alice! Excited to be here.");
        saveMsg(general.getId(), carol.getId(), "Looks great! What are we building first?");
        saveMsg(general.getId(), alice.getId(), "We're starting with the authentication module. Bob, can you take the lead on JWT?");
        saveMsg(general.getId(), bob.getId(), "On it! I'll have a PR up by EOD.");
        saveMsg(general.getId(), carol.getId(), "I'll start on the React login page then. Coordination 🤝");

        // Messages in #backend
        saveMsg(backend.getId(), bob.getId(), "Just pushed the JWT auth implementation. Please review.");
        saveMsg(backend.getId(), alice.getId(), "Reviewed — looks solid. Left a few comments on the refresh token rotation.");
        saveMsg(backend.getId(), bob.getId(), "Good catch! Fixed. Merging now.");
        saveMsg(backend.getId(), carol.getId(), "Should we add rate limiting to the /auth endpoints?");
        saveMsg(backend.getId(), alice.getId(), "Yes — added it to the backlog. Will tackle after we wire up the WebSocket layer.");

        // Messages in #frontend
        saveMsg(frontend.getId(), carol.getId(), "Login page is done! Dark theme looks 🔥");
        saveMsg(frontend.getId(), bob.getId(), "The Teams-style sidebar is chef's kiss. Great work.");
        saveMsg(frontend.getId(), carol.getId(), "Working on the message list now — grouping consecutive messages like real Teams.");
        saveMsg(frontend.getId(), alice.getId(), "Make sure we handle the date separators too (Today, Yesterday).");
        saveMsg(frontend.getId(), carol.getId(), "Already done 🙌");

        // ── Team: Design ─────────────────────────────────────────
        Team design = teamRepository.save(Team.builder()
                .name("Design")
                .description("Product design and user experience")
                .ownerId(carol.getId())
                .build());

        teamMemberRepository.save(TeamMember.builder().teamId(design.getId()).userId(carol.getId()).role(TeamRole.OWNER).build());
        teamMemberRepository.save(TeamMember.builder().teamId(design.getId()).userId(dave.getId()).role(TeamRole.MEMBER).build());

        Channel designGeneral = channelRepository.save(Channel.builder()
                .teamId(design.getId()).name("general")
                .description("General design discussions")
                .createdBy(carol.getId()).build());

        Channel designReview = channelRepository.save(Channel.builder()
                .teamId(design.getId()).name("design-review")
                .description("Share designs for feedback")
                .createdBy(carol.getId()).build());

        saveMsg(designGeneral.getId(), carol.getId(), "Welcome to the Design team! Figma link in pinned messages.");
        saveMsg(designGeneral.getId(), dave.getId(), "Thanks! Should we do a kickoff call tomorrow?");
        saveMsg(designGeneral.getId(), carol.getId(), "Absolutely — 10am works?");
        saveMsg(designReview.getId(), carol.getId(), "Dashboard redesign v2 is ready for review. Feedback welcome!");
        saveMsg(designReview.getId(), dave.getId(), "Love the card layout. The colour contrast on the dark theme is much better.");

        // ── DMs: Alice ↔ Bob ─────────────────────────────────────
        Conversation aliceBob = conversationRepository.save(Conversation.builder()
                .participant1Id(alice.getId())
                .participant2Id(bob.getId())
                .build());

        saveDM(aliceBob.getId(), alice.getId(), "Hey Bob, quick question — are you free for a standup at 9am?");
        saveDM(aliceBob.getId(), bob.getId(), "Yep! Calendar is clear. Will hop on.");
        saveDM(aliceBob.getId(), alice.getId(), "Perfect. Sending the invite now.");
        saveDM(aliceBob.getId(), bob.getId(), "Got it, see you then 👍");

        // ── DMs: Carol ↔ Alice ────────────────────────────────────
        Conversation carolAlice = conversationRepository.save(Conversation.builder()
                .participant1Id(carol.getId())
                .participant2Id(alice.getId())
                .build());

        saveDM(carolAlice.getId(), carol.getId(), "Alice, the new search page is live on port 3000!");
        saveDM(carolAlice.getId(), alice.getId(), "Just checked — looks amazing. The debounce is super smooth.");
        saveDM(carolAlice.getId(), carol.getId(), "Thanks! It's 400ms — felt right.");

        log.info("DataSeeder: done. Seeded 4 users, 2 teams, 5 channels, 20+ messages, 2 DM threads.");
        log.info("DataSeeder: login with alice@demo.com / password123");
    }

    private void saveMsg(java.util.UUID channelId, java.util.UUID senderId, String content) {
        messageRepository.save(Message.builder()
                .channelId(channelId).senderId(senderId)
                .content(content).deleted(false)
                .createdAt(Instant.now().minusSeconds((long)(Math.random() * 7200)))
                .build());
    }

    private void saveDM(java.util.UUID convId, java.util.UUID senderId, String content) {
        directMessageRepository.save(DirectMessage.builder()
                .conversationId(convId).senderId(senderId)
                .content(content).deleted(false)
                .build());
    }
}
