package com.teamsclone.file.controller;

import com.teamsclone.common.response.ApiResponse;
import com.teamsclone.file.domain.FileMetadata;
import com.teamsclone.file.dto.FileUploadResponse;
import com.teamsclone.file.service.FileService;
import com.teamsclone.security.CurrentUserResolver;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileService fileService;
    private final CurrentUserResolver currentUserResolver;

    public FileController(FileService fileService, CurrentUserResolver currentUserResolver) {
        this.fileService = fileService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file) {
        UUID userId = currentUserResolver.getCurrentUserId();
        FileUploadResponse response = fileService.uploadFile(file, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID fileId) {
        try {
            FileMetadata metadata = fileService.getMetadata(fileId);
            Path filePath = fileService.getFilePath(fileId);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = metadata.getContentType() != null
                    ? metadata.getContentType()
                    : "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + metadata.getOriginalFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
