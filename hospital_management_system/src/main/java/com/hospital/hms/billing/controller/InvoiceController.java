package com.hospital.hms.billing.controller;

import com.hospital.hms.billing.dto.InvoiceRequest;
import com.hospital.hms.billing.dto.InvoiceResponse;
import com.hospital.hms.billing.dto.InvoiceStatusUpdateRequest;
import com.hospital.hms.billing.service.InvoiceService;
import com.hospital.hms.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Billing / Invoices.
 * Base URL: /api/v1/invoices
 */
@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /** GET /api/v1/invoices */
    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        return ResponseEntity.ok(
                ApiResponse.success(invoiceService.getAllInvoices(), "Invoices retrieved successfully."));
    }

    /** GET /api/v1/invoices/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(invoiceService.getInvoiceById(id), "Invoice retrieved successfully."));
    }

    /** POST /api/v1/invoices */
    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(
            @Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(invoiceService.createInvoice(request), "Invoice created successfully."));
    }

    /** PATCH /api/v1/invoices/{id} — update status only */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody InvoiceStatusUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(invoiceService.updateStatus(id, request.getStatus()), "Invoice status updated."));
    }
}
