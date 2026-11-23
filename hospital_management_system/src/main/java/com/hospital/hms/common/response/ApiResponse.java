package com.hospital.hms.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Generic structured API response wrapper for all endpoints.
 *
 * @param <T> the type of data payload
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final int status;
    private final String message;
    private final T data;
    private final Object errors;

    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();

    // ── Static factory helpers ──────────────────────────────────────────────

    public static <T> ApiResponse<T> success(T data, String message, int status) {
        return ApiResponse.<T>builder()
                .success(true)
                .status(status)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return success(data, message, 200);
    }

    public static <T> ApiResponse<T> success(String message) {
        return success(null, message, 200);
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return success(data, message, 201);
    }

    public static <T> ApiResponse<T> error(String message, int status, Object errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .status(status)
                .message(message)
                .errors(errors)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, int status) {
        return error(message, status, null);
    }
}

