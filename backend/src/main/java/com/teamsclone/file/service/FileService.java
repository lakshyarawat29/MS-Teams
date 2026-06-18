package com.teamsclone.file.service;

import com.teamsclone.common.exception.ApiException;
import com.teamsclone.common.exception.ErrorCode;
import com.teamsclone.file.domain.FileMetadata;
import com.teamsclone.file.dto.FileUploadResponse;
import com.teamsclone.file.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileService {

    private final FileMetadataRepository fileMetadataRepository;
    private final Path uploadDir;

    public FileService(FileMetadataRepository fileMetadataRepository,
                       @Value("${app.upload-dir:uploads}") String uploadDirPath) throws IOException {
        this.fileMetadataRepository = fileMetadataRepository;
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    public FileUploadResponse uploadFile(MultipartFile file, UUID uploadedBy) {
        try {
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String ext = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : "";
            String storedFilename = UUID.randomUUID() + ext;

            Path targetPath = uploadDir.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            FileMetadata metadata = FileMetadata.builder()
                    .originalFilename(originalFilename)
                    .contentType(file.getContentType())
                    .storedFilename(storedFilename)
                    .size(file.getSize())
                    .uploadedBy(uploadedBy)
                    .build();
            metadata = fileMetadataRepository.save(metadata);

            return toResponse(metadata);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public FileMetadata getMetadata(UUID fileId) {
        return fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.FILE_NOT_FOUND, "File not found"));
    }

    public Path getFilePath(UUID fileId) {
        FileMetadata metadata = getMetadata(fileId);
        return uploadDir.resolve(metadata.getStoredFilename());
    }

    private FileUploadResponse toResponse(FileMetadata m) {
        return new FileUploadResponse(
                m.getId(),
                m.getOriginalFilename(),
                m.getContentType(),
                m.getSize(),
                "/api/v1/files/" + m.getId() + "/download"
        );
    }
}
