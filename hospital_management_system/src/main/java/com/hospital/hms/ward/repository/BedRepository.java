package com.hospital.hms.ward.repository;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import com.hospital.hms.ward.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Bed} entities.
 * Extends {@link JpaSpecificationExecutor} to support dynamic Specification-based filtering.
 */
@Repository
public interface BedRepository extends JpaRepository<Bed, Long>, JpaSpecificationExecutor<Bed> {

    List<Bed> findByWardId(Long wardId);

    List<Bed> findByWardIdAndStatus(Long wardId, BedStatus status);

    List<Bed> findByStatus(BedStatus status);

    Optional<Bed> findByBedNumberAndWardId(String bedNumber, Long wardId);

    boolean existsByBedNumberAndWardId(String bedNumber, Long wardId);

    /**
     * Locks a bed row for update to prevent race conditions during concurrent admissions.
     */
    @Query("SELECT b FROM Bed b WHERE b.id = :id AND b.status = :status")
    Optional<Bed> findByIdAndStatus(@Param("id") Long id, @Param("status") BedStatus status);

    /**
     * Bulk update: sets all AVAILABLE beds to RESERVED for a given list of IDs.
     */
    @Modifying
    @Query("UPDATE Bed b SET b.status = :newStatus WHERE b.id IN :ids")
    int bulkUpdateStatus(@Param("ids") List<Long> ids, @Param("newStatus") BedStatus newStatus);

    /**
     * Find first available bed in a ward by type (for auto-assignment).
     */
    @Query("""
            SELECT b FROM Bed b
            WHERE b.ward.id = :wardId
            AND b.bedType = :bedType
            AND b.status = com.hospital.hms.common.enums.BedStatus.AVAILABLE
            ORDER BY b.bedNumber ASC
            LIMIT 1
            """)
    Optional<Bed> findFirstAvailableBedInWard(@Param("wardId") Long wardId, @Param("bedType") BedType bedType);
}

