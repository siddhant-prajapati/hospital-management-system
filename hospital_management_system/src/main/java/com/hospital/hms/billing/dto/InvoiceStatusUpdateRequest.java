package com.hospital.hms.billing.dto;

import com.hospital.hms.billing.enums.InvoiceStatus;
import lombok.Data;

@Data
public class InvoiceStatusUpdateRequest {
    private InvoiceStatus status;
}
