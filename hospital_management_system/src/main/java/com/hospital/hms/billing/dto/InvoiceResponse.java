package com.hospital.hms.billing.dto;

import com.hospital.hms.billing.enums.InvoiceStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long patientId;
    private String patientName;
    private LocalDate date;
    private List<InvoiceItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal gstAmount;
    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
