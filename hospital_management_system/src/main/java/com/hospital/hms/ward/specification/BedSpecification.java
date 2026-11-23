package com.hospital.hms.ward.specification;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import com.hospital.hms.common.enums.WardType;
import com.hospital.hms.ward.entity.Bed;
import com.hospital.hms.ward.entity.Ward;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/**
 * JPA Specification (Criteria API) builders for Bed filtering.
 * <p>
 * Enables dynamic query construction without writing custom JPQL for every combination.
 * Usage: {@code BedRepository.findAll(BedSpecification.withFilters(...), pageable)}
 * </p>
 */
public final class BedSpecification {

    private BedSpecification() {}

    /**
     * Filters beds by ward ID (required).
     */
    public static Specification<Bed> byWardId(Long wardId) {
        return (root, query, cb) -> {
            if (wardId == null) return cb.conjunction();
            return cb.equal(root.get("ward").get("id"), wardId);
        };
    }

    /**
     * Filters beds by occupancy / availability status.
     */
    public static Specification<Bed> byStatus(BedStatus status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    /**
     * Convenience: only AVAILABLE beds.
     */
    public static Specification<Bed> isAvailable() {
        return byStatus(BedStatus.AVAILABLE);
    }

    /**
     * Filters beds by bed type.
     */
    public static Specification<Bed> byBedType(BedType bedType) {
        return (root, query, cb) -> {
            if (bedType == null) return cb.conjunction();
            return cb.equal(root.get("bedType"), bedType);
        };
    }

    /**
     * Filters beds whose ward is of a specific ward type (joins Ward table).
     */
    public static Specification<Bed> byWardType(WardType wardType) {
        return (root, query, cb) -> {
            if (wardType == null) return cb.conjunction();
            Join<Bed, Ward> wardJoin = root.join("ward", JoinType.INNER);
            return cb.equal(wardJoin.get("wardType"), wardType);
        };
    }

    /**
     * Composite filter: combine ward ID + status + bed type dynamically.
     * Caller passes null to skip any individual filter.
     */
    public static Specification<Bed> withFilters(Long wardId, BedStatus status, BedType bedType) {
        return Specification
                .where(byWardId(wardId))
                .and(byStatus(status))
                .and(byBedType(bedType));
    }
}

