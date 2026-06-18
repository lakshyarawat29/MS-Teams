package com.teamsclone.file.dto;

import java.util.UUID;

public record FileUploadResponse(
        UUID id,
        String originalFilename,
        String contentType,
        long size,
        String url
) {
}
