package com.hospital.hms.ward.dto;

import com.hospital.hms.common.enums.BedStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BedAssignRequest {
    @NotNull
    private Long patientId;
    private String patientName;
    private BedStatus status;
}
