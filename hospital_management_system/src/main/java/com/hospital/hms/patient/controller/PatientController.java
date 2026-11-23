package com.hospital.hms.patient.controller;

import com.hospital.hms.common.response.ApiResponse;
import com.hospital.hms.patient.dto.PatientRequest;
import com.hospital.hms.patient.dto.PatientResponse;
import com.hospital.hms.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Patient management & Admissions.
 * Base URL: /api/v1/patients
 */
@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    /** GET /api/v1/patients — list all patients */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getAllPatients() {
        return ResponseEntity.ok(
                ApiResponse.success(patientService.getAllPatients(), "Patients retrieved successfully."));
    }

    /** GET /api/v1/patients/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(patientService.getPatientById(id), "Patient retrieved successfully."));
    }

    /** POST /api/v1/patients */
    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponse>> createPatient(
            @Valid @RequestBody PatientRequest request) {
        PatientResponse created = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Patient registered successfully."));
    }

    /** PUT /api/v1/patients/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(patientService.updatePatient(id, request), "Patient updated successfully."));
    }

    /** DELETE /api/v1/patients/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully."));
    }

    /**
     * POST /api/v1/patients/{patientId}/assign-bed
     * Assigns an available bed to this patient (admission workflow).
     */
    @PostMapping("/{patientId}/assign-bed")
    public ResponseEntity<ApiResponse<PatientResponse>> assignBed(
            @PathVariable Long patientId,
            @RequestBody Map<String, Object> payload) {
        Object rawBedId = payload.get("bedId");
        if (rawBedId == null) {
            throw new IllegalArgumentException("bedId is required");
        }
        Long bedId = Long.valueOf(rawBedId.toString());
        PatientResponse response = patientService.assignBed(patientId, bedId);
        return ResponseEntity.ok(ApiResponse.success(response, "Bed assigned to patient successfully."));
    }

    /**
     * POST /api/v1/patients/{patientId}/discharge
     * Discharges patient and frees their assigned bed.
     */
    @PostMapping("/{patientId}/discharge")
    public ResponseEntity<ApiResponse<PatientResponse>> dischargePatient(
            @PathVariable Long patientId) {
        PatientResponse response = patientService.dischargePatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(response, "Patient discharged and bed freed successfully."));
    }
}
