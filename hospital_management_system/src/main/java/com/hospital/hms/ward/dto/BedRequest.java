package com.hospital.hms.ward.dto;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request DTO for creating or updating a Bed within a Ward.
 */
@Data
public class BedRequest {

    @NotBlank(message = "Bed number is required")
    @Size(max = 20, message = "Bed number must not exceed 20 characters")
    private String bedNumber;

    @NotNull(message = "Bed type is required")
    private BedType bedType;

    private BedStatus status = BedStatus.AVAILABLE;

    @DecimalMin(value = "0.0", inclusive = false, message = "Daily rate must be positive")
    @Digits(integer = 8, fraction = 2, message = "Daily rate format: up to 8 digits, 2 decimal places")
    private BigDecimal dailyRate;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}

