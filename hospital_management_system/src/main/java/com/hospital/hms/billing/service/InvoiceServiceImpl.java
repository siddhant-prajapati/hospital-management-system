package com.hospital.hms.billing.service;

import com.hospital.hms.billing.dto.*;
import com.hospital.hms.billing.entity.Invoice;
import com.hospital.hms.billing.entity.InvoiceItem;
import com.hospital.hms.billing.enums.InvoiceStatus;
import com.hospital.hms.billing.repository.InvoiceRepository;
import com.hospital.hms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Invoice invoice = Invoice.builder()
                .invoiceNumber(request.getInvoiceNumber())
                .patientId(request.getPatientId())
                .patientName(request.getPatientName())
                .date(request.getDate())
                .subtotal(request.getSubtotal())
                .gstAmount(request.getGstAmount())
                .totalAmount(request.getTotalAmount())
                .status(request.getStatus() != null ? request.getStatus() : InvoiceStatus.Pending)
                .build();

        if (request.getItems() != null) {
            for (InvoiceItemRequest itemReq : request.getItems()) {
                InvoiceItem item = InvoiceItem.builder()
                        .clientId(itemReq.getId())
                        .description(itemReq.getDescription())
                        .quantity(itemReq.getQuantity())
                        .unitPrice(itemReq.getUnitPrice())
                        .gstRate(itemReq.getGstRate() != null ? itemReq.getGstRate() : java.math.BigDecimal.ZERO)
                        .invoice(invoice)
                        .build();
                invoice.getItems().add(item);
            }
        }

        return toResponse(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceResponse updateStatus(Long id, InvoiceStatus status) {
        Invoice invoice = findOrThrow(id);
        invoice.setStatus(status);
        return toResponse(invoiceRepository.save(invoice));
    }

    private Invoice findOrThrow(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
    }

    private InvoiceResponse toResponse(Invoice inv) {
        List<InvoiceItemResponse> itemResponses = inv.getItems().stream()
                .map(i -> InvoiceItemResponse.builder()
                        .id(i.getId())
                        .clientId(i.getClientId())
                        .description(i.getDescription())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .gstRate(i.getGstRate())
                        .build())
                .collect(Collectors.toList());

        return InvoiceResponse.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .patientId(inv.getPatientId())
                .patientName(inv.getPatientName())
                .date(inv.getDate())
                .items(itemResponses)
                .subtotal(inv.getSubtotal())
                .gstAmount(inv.getGstAmount())
                .totalAmount(inv.getTotalAmount())
                .status(inv.getStatus())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }
}
