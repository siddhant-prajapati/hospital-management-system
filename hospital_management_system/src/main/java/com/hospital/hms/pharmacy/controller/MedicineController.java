package com.hospital.hms.pharmacy.controller;

import com.hospital.hms.common.response.ApiResponse;
import com.hospital.hms.pharmacy.dto.MedicineRequest;
import com.hospital.hms.pharmacy.dto.MedicineResponse;
import com.hospital.hms.pharmacy.dto.StockUpdateRequest;
import com.hospital.hms.pharmacy.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Pharmacy / Medicine Inventory.
 * Base URL: /api/v1/medicines
 */
@RestController
@RequestMapping("/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    /** GET /api/v1/medicines */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getAllMedicines() {
        return ResponseEntity.ok(
                ApiResponse.success(medicineService.getAllMedicines(), "Medicines retrieved successfully."));
    }

    /** GET /api/v1/medicines/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicine(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(medicineService.getMedicineById(id), "Medicine retrieved successfully."));
    }

    /** POST /api/v1/medicines */
    @PostMapping
    public ResponseEntity<ApiResponse<MedicineResponse>> createMedicine(
            @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(medicineService.createMedicine(request), "Medicine added successfully."));
    }

    /** PUT /api/v1/medicines/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(medicineService.updateMedicine(id, request), "Medicine updated successfully."));
    }

    /** PATCH /api/v1/medicines/{id} — update stock only */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(medicineService.updateStock(id, request.getStock()), "Stock updated successfully."));
    }

    /** DELETE /api/v1/medicines/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine deleted successfully."));
    }
}
