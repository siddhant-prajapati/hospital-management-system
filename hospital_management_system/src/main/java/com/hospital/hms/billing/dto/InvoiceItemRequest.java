package com.hospital.hms.billing.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceItemRequest {
    private String id;    // client-side UUID
    @NotBlank
    private String description;
    @NotNull @Min(1)
    private Integer quantity;
    @NotNull @DecimalMin("0.0")
    private BigDecimal unitPrice;
    @DecimalMin("0.0") @DecimalMax("100.0")
    private BigDecimal gstRate = BigDecimal.ZERO;
}
