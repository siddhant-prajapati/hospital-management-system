package com.hospital.hms.billing.service;

import com.hospital.hms.billing.dto.InvoiceRequest;
import com.hospital.hms.billing.dto.InvoiceResponse;
import com.hospital.hms.billing.enums.InvoiceStatus;

import java.util.List;

public interface InvoiceService {
    List<InvoiceResponse> getAllInvoices();
    InvoiceResponse getInvoiceById(Long id);
    InvoiceResponse createInvoice(InvoiceRequest request);
    InvoiceResponse updateStatus(Long id, InvoiceStatus status);
}
