package com.hospital.hms.patient.dto;

import com.hospital.hms.patient.enums.Gender;
import com.hospital.hms.patient.enums.PatientStatus;
import com.hospital.hms.patient.enums.VisitType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PatientRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 150)
    private String name;

    @NotNull(message = "Age is required")
    @Min(0) @Max(150)
    private Integer age;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "[0-9]{10}", message = "Phone must be a 10-digit number")
    private String phone;

    @NotNull(message = "Visit type is required")
    private VisitType type;

    private PatientStatus status = PatientStatus.Active;
}
