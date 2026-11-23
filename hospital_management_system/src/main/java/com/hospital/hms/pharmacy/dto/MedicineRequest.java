package com.hospital.hms.pharmacy.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MedicineRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 100)
    private String category;

    @NotNull
    @Min(0)
    private Integer stock;

    @NotNull
    @Min(0)
    private Integer minThreshold;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal unitPrice;

    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private BigDecimal gstRate = BigDecimal.ZERO;
}
