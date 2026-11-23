package com.hospital.hms.billing.dto;

import com.hospital.hms.billing.enums.InvoiceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequest {

    @NotBlank
    private String invoiceNumber;

    @NotNull
    private Long patientId;

    @NotBlank
    private String patientName;

    @NotNull
    private LocalDate date;

    @NotNull @Size(min = 1)
    @Valid
    private List<InvoiceItemRequest> items;

    @NotNull @DecimalMin("0.0")
    private BigDecimal subtotal;

    @NotNull @DecimalMin("0.0")
    private BigDecimal gstAmount;

    @NotNull @DecimalMin("0.0")
    private BigDecimal totalAmount;

    private InvoiceStatus status = InvoiceStatus.Pending;
}
