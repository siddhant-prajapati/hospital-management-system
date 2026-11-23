package com.hospital.hms.ward.repository;

import com.hospital.hms.ward.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Ward} entities.
 * Extends {@link JpaSpecificationExecutor} to support dynamic Specification-based filtering.
 */
@Repository
public interface WardRepository extends JpaRepository<Ward, Long>, JpaSpecificationExecutor<Ward> {

    Optional<Ward> findByWardNameIgnoreCase(String wardName);

    List<Ward> findByIsActiveTrue();

    boolean existsByWardNameIgnoreCase(String wardName);

    /**
     * Counts how many available beds a specific ward currently has.
     */
    @Query("""
            SELECT COUNT(b) FROM Bed b
            WHERE b.ward.id = :wardId
            AND b.status = com.hospital.hms.common.enums.BedStatus.AVAILABLE
            """)
    long countAvailableBedsByWardId(Long wardId);
}

