package com.hospital.hms.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * Wrapper for paginated list responses.
 *
 * @param <T> element type
 */
@Getter
@AllArgsConstructor
public class PagedResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean last;
}

