package com.hospital.hms.ward.entity;

import com.hospital.hms.common.audit.AuditableEntity;
import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Represents a physical bed inside a Ward.
 * Tracks occupancy status, type, and nightly rate for billing.
 */
@Entity
@Table(
    name = "beds",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_bed_number_ward",
        columnNames = {"bed_number", "ward_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bed extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Human-readable bed number within the ward (e.g., "A-101").
     */
    @Column(name = "bed_number", nullable = false, length = 20)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "bed_type", nullable = false, length = 30)
    @Builder.Default
    private BedType bedType = BedType.STANDARD;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 25)
    @Builder.Default
    private BedStatus status = BedStatus.AVAILABLE;

    /**
     * Nightly charge rate for billing calculations.
     */
    @Column(name = "daily_rate", precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // ── Occupancy tracking (denormalized for performance) ───────────────────

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "patient_name", length = 150)
    private String patientName;

    // ── Relationships ───────────────────────────────────────────────────────

    /**
     * Many Beds → One Ward.
     * FetchType.LAZY: load ward only when explicitly accessed.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_bed_ward"))
    private Ward ward;
}

