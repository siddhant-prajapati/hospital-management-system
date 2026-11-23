package com.hospital.hms.ward.dto;

import com.hospital.hms.common.enums.WardType;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request DTO for creating or updating a Ward.
 */
@Data
public class WardRequest {

    @NotBlank(message = "Ward name is required")
    @Size(min = 2, max = 100, message = "Ward name must be between 2 and 100 characters")
    private String wardName;

    @NotNull(message = "Ward type is required")
    private WardType wardType;

    @NotNull(message = "Total capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 500, message = "Capacity cannot exceed 500")
    private Integer totalCapacity;

    private Integer floorNumber;

    @Size(max = 50, message = "Wing must not exceed 50 characters")
    private String wing;

    private Boolean isActive = true;
}

