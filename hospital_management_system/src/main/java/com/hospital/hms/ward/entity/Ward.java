package com.hospital.hms.ward.entity;

import com.hospital.hms.common.audit.AuditableEntity;
import com.hospital.hms.common.enums.WardType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a hospital ward (e.g., ICU, General, Maternity).
 * A Ward contains many Beds (1-to-N relationship).
 */
@Entity
@Table(name = "wards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ward extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ward_name", nullable = false, unique = true, length = 100)
    private String wardName;

    @Enumerated(EnumType.STRING)
    @Column(name = "ward_type", nullable = false, length = 30)
    private WardType wardType;

    /**
     * Maximum number of beds this ward is designed to hold.
     */
    @Column(name = "total_capacity", nullable = false)
    private Integer totalCapacity;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "wing", length = 50)
    private String wing;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ── Relationships ───────────────────────────────────────────────────────

    /**
     * One Ward → Many Beds.
     * CascadeType.ALL: beds are managed with the ward.
     * orphanRemoval: removing a bed from the list deletes it from DB.
     */
    @OneToMany(mappedBy = "ward", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Bed> beds = new ArrayList<>();

    // ── Convenience helper ───────────────────────────────────────────────────

    public void addBed(Bed bed) {
        beds.add(bed);
        bed.setWard(this);
    }

    public void removeBed(Bed bed) {
        beds.remove(bed);
        bed.setWard(null);
    }
}

