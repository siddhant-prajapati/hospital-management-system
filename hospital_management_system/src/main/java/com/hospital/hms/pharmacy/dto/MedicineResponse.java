package com.hospital.hms.pharmacy.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MedicineResponse {
    private Long id;
    private String name;
    private String category;
    private Integer stock;
    private Integer minThreshold;
    private BigDecimal unitPrice;
    private BigDecimal gstRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
