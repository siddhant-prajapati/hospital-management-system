package com.hospital.hms.ward.service;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import com.hospital.hms.common.response.PagedResponse;
import com.hospital.hms.ward.dto.BedFilterRequest;
import com.hospital.hms.ward.dto.BedRequest;
import com.hospital.hms.ward.dto.BedResponse;

import java.util.List;

/**
 * Service contract for Bed management operations.
 * All business logic is in {@link BedServiceImpl}.
 */
public interface BedService {

    /**
     * Adds a new bed to an existing ward.
     * Throws {@link com.hospital.hms.common.exception.DuplicateResourceException}
     * if the bed number already exists in that ward.
     */
    BedResponse addBedToWard(Long wardId, BedRequest request);

    /**
     * Retrieves a specific bed by its ID.
     */
    BedResponse getBedById(Long bedId);

    /**
     * Returns all beds matching the given filter criteria using JPA Specification.
     */
    PagedResponse<BedResponse> getBeds(BedFilterRequest filter);

    /**
     * Returns all AVAILABLE beds in a given ward.
     */
    List<BedResponse> getAvailableBedsInWard(Long wardId);

    /**
     * Updates bed details (type, rate, notes). Status changes use dedicated methods.
     */
    BedResponse updateBed(Long bedId, BedRequest request);

    /**
     * Marks a bed as AVAILABLE. Used on patient discharge.
     */
    BedResponse releaseBed(Long bedId);

    /**
     * Marks a bed as UNDER_MAINTENANCE.
     */
    BedResponse markBedUnderMaintenance(Long bedId);

    /**
     * Deletes a bed permanently. Only allowed if the bed is AVAILABLE.
     */
    void deleteBed(Long bedId);

    /**
     * Finds and returns the first available bed of the given type in a ward.
     * Used internally by the Admission module for auto-assignment.
     */
    BedResponse findFirstAvailableBed(Long wardId, BedType bedType);

    /**
     * Assigns a patient to a bed, marking it OCCUPIED.
     */
    BedResponse assignPatient(Long bedId, Long patientId, String patientName);

    /**
     * Releases a bed back to AVAILABLE or UNDER_MAINTENANCE, clearing patient info.
     */
    BedResponse releaseToStatus(Long bedId, com.hospital.hms.common.enums.BedStatus nextStatus);
}

