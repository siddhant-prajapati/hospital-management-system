package com.hospital.hms.ward.controller;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import com.hospital.hms.common.enums.WardType;
import com.hospital.hms.common.response.ApiResponse;
import com.hospital.hms.common.response.PagedResponse;
import com.hospital.hms.ward.dto.BedAssignRequest;
import com.hospital.hms.ward.dto.BedFilterRequest;
import com.hospital.hms.ward.dto.BedRequest;
import com.hospital.hms.ward.dto.BedResponse;
import com.hospital.hms.ward.service.BedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Bed management within Wards.
 * <p>
 * HTTP concern only: routing, validation delegation, response wrapping.
 * No business logic. No repository access.
 * </p>
 *
 * Base URL: /api/v1
 * Ward-scoped routes: /api/v1/wards/{wardId}/beds
 * Bed direct routes:  /api/v1/beds
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    /**
     * POST /api/v1/wards/{wardId}/beds
     * Add a new bed to a specific ward. Admin only.
     */
    @PostMapping("/wards/{wardId}/beds")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BedResponse>> addBed(
            @PathVariable Long wardId,
            @Valid @RequestBody BedRequest request) {

        BedResponse created = bedService.addBedToWard(wardId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Bed added to ward successfully."));
    }

    /**
     * GET /api/v1/beds/{bedId}
     * Fetch a single bed by its ID.
     */
    @GetMapping("/beds/{bedId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BedResponse>> getBed(@PathVariable Long bedId) {
        return ResponseEntity.ok(
                ApiResponse.success(bedService.getBedById(bedId), "Bed retrieved successfully."));
    }

    /**
     * GET /api/v1/beds
     * List beds with dynamic filtering using Specification (Criteria API).
     *
     * Query params (all optional):
     *   wardId, status (BedStatus enum), bedType (BedType enum), wardType (WardType enum),
     *   page, size, sortBy, sortDir
     */
    @GetMapping("/beds")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<BedResponse>>> getBeds(
            @RequestParam(required = false) Long wardId,
            @RequestParam(required = false) BedStatus status,
            @RequestParam(required = false) BedType bedType,
            @RequestParam(required = false) WardType wardType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "bedNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        BedFilterRequest filter = new BedFilterRequest();
        filter.setWardId(wardId);
        filter.setStatus(status);
        filter.setBedType(bedType);
        filter.setWardType(wardType);
        filter.setPage(page);
        filter.setSize(size);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);

        PagedResponse<BedResponse> result = bedService.getBeds(filter);
        return ResponseEntity.ok(ApiResponse.success(result, "Beds retrieved successfully."));
    }

    /**
     * GET /api/v1/wards/{wardId}/beds/available
     * List all AVAILABLE beds in a specific ward.
     * Used by Admission module for bed selection UI.
     */
    @GetMapping("/wards/{wardId}/beds/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BedResponse>>> getAvailableBeds(@PathVariable Long wardId) {
        return ResponseEntity.ok(
                ApiResponse.success(bedService.getAvailableBedsInWard(wardId),
                        "Available beds retrieved."));
    }

    /**
     * GET /api/v1/wards/{wardId}/beds
     * List all beds in a ward (no status filter). Delegates to the filtered endpoint.
     */
    @GetMapping("/wards/{wardId}/beds")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<BedResponse>>> getBedsInWard(
            @PathVariable Long wardId,
            @RequestParam(required = false) BedStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        BedFilterRequest filter = new BedFilterRequest();
        filter.setWardId(wardId);
        filter.setStatus(status);
        filter.setPage(page);
        filter.setSize(size);

        return ResponseEntity.ok(
                ApiResponse.success(bedService.getBeds(filter), "Beds retrieved."));
    }

    /**
     * PUT /api/v1/beds/{bedId}
     * Update bed details (number, type, rate, notes). Admin only.
     */
    @PutMapping("/beds/{bedId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BedResponse>> updateBed(
            @PathVariable Long bedId,
            @Valid @RequestBody BedRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(bedService.updateBed(bedId, request), "Bed updated successfully."));
    }

    /**
     * PATCH /api/v1/beds/{bedId}/release
     * Release an occupied/reserved bed back to AVAILABLE status.
     * Triggered by discharge workflow. Admin + Nurse role.
     */
    @PatchMapping("/beds/{bedId}/release")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    public ResponseEntity<ApiResponse<BedResponse>> releaseBed(@PathVariable Long bedId) {
        return ResponseEntity.ok(
                ApiResponse.success(bedService.releaseBed(bedId), "Bed released to available status."));
    }

    /**
     * PATCH /api/v1/beds/{bedId}/maintenance
     * Mark a bed as UNDER_MAINTENANCE. Admin only.
     */
    @PatchMapping("/beds/{bedId}/maintenance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BedResponse>> markMaintenance(@PathVariable Long bedId) {
        return ResponseEntity.ok(
                ApiResponse.success(bedService.markBedUnderMaintenance(bedId),
                        "Bed marked as under maintenance."));
    }

    /**
     * DELETE /api/v1/beds/{bedId}
     * Permanently delete a bed. Only possible when AVAILABLE. Admin only.
     */
    @DeleteMapping("/beds/{bedId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBed(@PathVariable Long bedId) {
        bedService.deleteBed(bedId);
        return ResponseEntity.ok(ApiResponse.<Void>success("Bed deleted successfully."));
    }

    /**
     * POST /api/v1/beds/{bedId}/assign
     * PATCH /api/v1/beds/{bedId}/assign
     * Assign a patient to a bed (marks bed OCCUPIED and patient ADMITTED).
     */
    @RequestMapping(value = "/beds/{bedId}/assign", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<ApiResponse<BedResponse>> assignPatient(
            @PathVariable Long bedId,
            @RequestBody com.hospital.hms.ward.dto.BedAssignRequest request) {
        BedResponse response = bedService.assignPatient(bedId, request.getPatientId(), request.getPatientName());
        return ResponseEntity.ok(ApiResponse.success(response, "Patient assigned to bed successfully."));
    }

    /**
     * POST /api/v1/beds/{bedId}/status
     * PATCH /api/v1/beds/{bedId}/status
     * Update bed status to AVAILABLE or UNDER_MAINTENANCE (releases patient info).
     */
    @RequestMapping(value = "/beds/{bedId}/status", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<ApiResponse<BedResponse>> updateBedStatus(
            @PathVariable Long bedId,
            @RequestBody java.util.Map<String, String> body) {
        BedStatus nextStatus = BedStatus.valueOf(body.get("status"));
        BedResponse response = bedService.releaseToStatus(bedId, nextStatus);
        return ResponseEntity.ok(ApiResponse.success(response, "Bed status updated successfully."));
    }
}

