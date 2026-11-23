package com.hospital.hms.patient.entity;

import com.hospital.hms.common.audit.AuditableEntity;
import com.hospital.hms.patient.enums.Gender;
import com.hospital.hms.patient.enums.PatientStatus;
import com.hospital.hms.patient.enums.VisitType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a hospital patient (OPD or IPD).
 */
@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 10)
    private Gender gender;

    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "visit_type", nullable = false, length = 10)
    private VisitType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private PatientStatus status = PatientStatus.Active;

    // ── Bed Allocation Tracking ─────────────────────────────────────────────
    @Column(name = "assigned_bed_id")
    private Long assignedBedId;

    @Column(name = "assigned_bed_number", length = 30)
    private String assignedBedNumber;

    @Column(name = "assigned_ward_name", length = 100)
    private String assignedWardName;
}
