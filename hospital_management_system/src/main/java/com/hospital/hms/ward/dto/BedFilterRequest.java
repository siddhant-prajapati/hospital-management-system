package com.hospital.hms.ward.dto;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import com.hospital.hms.common.enums.WardType;
import lombok.Data;

/**
 * Query/filter parameters for the Bed listing endpoint.
 * All fields are optional — omitted fields are ignored in the query.
 */
@Data
public class BedFilterRequest {
    private Long wardId;
    private BedStatus status;
    private BedType bedType;
    private WardType wardType;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "bedNumber";
    private String sortDir = "asc";
}

