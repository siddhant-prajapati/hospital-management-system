package com.hospital.hms.ward.dto;

import com.hospital.hms.common.enums.WardType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response DTO for Ward data returned to clients.
 * Never exposes internal JPA entity state directly.
 */
@Data
@Builder
public class WardResponse {

    private Long id;
    private String wardName;
    private WardType wardType;
    private Integer totalCapacity;
    private Integer floorNumber;
    private String wing;
    private Boolean isActive;

    // Computed fields (populated by service)
    private long availableBeds;
    private long occupiedBeds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

