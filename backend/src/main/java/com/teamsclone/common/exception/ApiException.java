package com.teamsclone.common.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;
    private final HttpStatus status;

    public ApiException(ErrorCode errorCode, String message, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    public static ApiException notFound(ErrorCode errorCode, String message) {
        return new ApiException(errorCode, message, HttpStatus.NOT_FOUND);
    }

    public static ApiException badRequest(ErrorCode errorCode, String message) {
        return new ApiException(errorCode, message, HttpStatus.BAD_REQUEST);
    }

    public static ApiException unauthorized(ErrorCode errorCode, String message) {
        return new ApiException(errorCode, message, HttpStatus.UNAUTHORIZED);
    }

    public static ApiException forbidden(ErrorCode errorCode, String message) {
        return new ApiException(errorCode, message, HttpStatus.FORBIDDEN);
    }

    public static ApiException conflict(ErrorCode errorCode, String message) {
        return new ApiException(errorCode, message, HttpStatus.CONFLICT);
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
