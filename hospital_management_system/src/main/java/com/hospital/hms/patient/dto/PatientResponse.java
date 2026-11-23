package com.hospital.hms.patient.dto;

import com.hospital.hms.patient.enums.Gender;
import com.hospital.hms.patient.enums.PatientStatus;
import com.hospital.hms.patient.enums.VisitType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PatientResponse {
    private Long id;
    private String name;
    private Integer age;
    private Gender gender;
    private String phone;
    private VisitType type;
    private PatientStatus status;

    // Bed assignment details
    private Long assignedBedId;
    private String assignedBedNumber;
    private String assignedWardName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
