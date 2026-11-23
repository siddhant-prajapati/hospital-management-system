package com.hospital.hms.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InvoiceItemResponse {
    private Long id;
    private String clientId;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal gstRate;
}
