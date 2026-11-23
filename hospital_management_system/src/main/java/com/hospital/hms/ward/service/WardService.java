package com.hospital.hms.ward.service;

import com.hospital.hms.common.enums.WardType;
import com.hospital.hms.common.response.PagedResponse;
import com.hospital.hms.ward.dto.WardRequest;
import com.hospital.hms.ward.dto.WardResponse;

import java.util.List;

/**
 * Service contract for Ward management operations.
 * All business logic is in {@link WardServiceImpl}.
 */
public interface WardService {

    /**
     * Creates a new ward. Throws {@link com.hospital.hms.common.exception.DuplicateResourceException}
     * if a ward with the same name already exists.
     */
    WardResponse createWard(WardRequest request);

    /**
     * Retrieves a ward by its ID.
     * Throws {@link com.hospital.hms.common.exception.ResourceNotFoundException} if not found.
     */
    WardResponse getWardById(Long wardId);

    /**
     * Returns all wards with dynamic filtering support.
     */
    PagedResponse<WardResponse> getAllWards(String name, WardType wardType, Integer floor,
                                            Boolean isActive, int page, int size,
                                            String sortBy, String sortDir);

    /**
     * Updates an existing ward's details.
     */
    WardResponse updateWard(Long wardId, WardRequest request);

    /**
     * Soft-deletes a ward by marking it as inactive.
     * Hard delete is blocked if the ward has occupied beds.
     */
    void deactivateWard(Long wardId);

    /**
     * Returns a list of all active wards (no pagination, for dropdowns/selects).
     */
    List<WardResponse> getAllActiveWards();
}

