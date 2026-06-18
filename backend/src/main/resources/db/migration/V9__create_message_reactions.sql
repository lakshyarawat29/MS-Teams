ALTER TABLE messages ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reaction UNIQUE (message_id, user_id, emoji)
);
CREATE INDEX idx_reactions_message_id ON message_reactions(message_id);
