package com.hospital.hms.ward.dto;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for Bed data returned to clients.
 */
@Data
@Builder
public class BedResponse {

    private Long id;
    private String bedNumber;
    private BedType bedType;
    private BedStatus status;
    private BigDecimal dailyRate;
    private String notes;

    // Nested ward summary (avoids full ward serialization)
    private Long wardId;
    private String wardName;
    private String wardType;   // string label for the UI (matches WardType enum name)

    // Occupancy fields (populated by assign/release operations)
    private Long patientId;
    private String patientName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

