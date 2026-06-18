package com.teamsclone.chat.dto;

import java.util.UUID;

public record ChannelEvent(String type, Object payload) {}
