package com.hospital.hms.ward.controller;

import com.hospital.hms.common.enums.WardType;
import com.hospital.hms.common.response.ApiResponse;
import com.hospital.hms.common.response.PagedResponse;
import com.hospital.hms.ward.dto.WardRequest;
import com.hospital.hms.ward.dto.WardResponse;
import com.hospital.hms.ward.service.WardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Ward management.
 * <p>
 * HTTP concern only: routing, validation delegation, response wrapping.
 * No business logic. No repository access.
 * </p>
 *
 * Base URL: /api/v1/wards
 */
@Slf4j
@RestController
@RequestMapping("/wards")
@RequiredArgsConstructor
public class WardController {

    private final WardService wardService;

    /**
     * POST /api/v1/wards
     * Create a new ward. Admin only.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WardResponse>> createWard(
            @Valid @RequestBody WardRequest request) {

        WardResponse created = wardService.createWard(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Ward created successfully."));
    }

    /**
     * GET /api/v1/wards/{wardId}
     * Fetch a single ward by ID. All authenticated users.
     */
    @GetMapping("/{wardId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WardResponse>> getWard(@PathVariable Long wardId) {
        return ResponseEntity.ok(
                ApiResponse.success(wardService.getWardById(wardId), "Ward retrieved successfully."));
    }

    /**
     * GET /api/v1/wards
     * List all wards with optional filtering and pagination.
     *
     * @param name      partial ward name search
     * @param wardType  filter by ward type enum
     * @param floor     filter by floor number
     * @param isActive  filter by active status
     * @param page      page number (0-based)
     * @param size      page size
     * @param sortBy    field to sort by
     * @param sortDir   asc | desc
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<WardResponse>>> getAllWards(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) WardType wardType,
            @RequestParam(required = false) Integer floor,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "wardName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        PagedResponse<WardResponse> response = wardService.getAllWards(
                name, wardType, floor, isActive, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response, "Wards retrieved successfully."));
    }

    /**
     * GET /api/v1/wards/active
     * Returns all active wards as a flat list (for dropdowns / UI selects).
     */
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<WardResponse>>> getAllActiveWards() {
        return ResponseEntity.ok(
                ApiResponse.success(wardService.getAllActiveWards(), "Active wards retrieved."));
    }

    /**
     * PUT /api/v1/wards/{wardId}
     * Update an existing ward. Admin only.
     */
    @PutMapping("/{wardId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WardResponse>> updateWard(
            @PathVariable Long wardId,
            @Valid @RequestBody WardRequest request) {

        WardResponse updated = wardService.updateWard(wardId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Ward updated successfully."));
    }

    /**
     * DELETE /api/v1/wards/{wardId}
     * Soft-deletes (deactivates) a ward. Admin only.
     * Will fail if any beds are currently occupied.
     */
    @DeleteMapping("/{wardId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateWard(@PathVariable Long wardId) {
        wardService.deactivateWard(wardId);
        return ResponseEntity.ok(ApiResponse.success("Ward deactivated successfully."));
    }
}

