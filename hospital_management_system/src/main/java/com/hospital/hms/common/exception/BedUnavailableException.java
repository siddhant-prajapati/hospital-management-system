package com.hospital.hms.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when no available beds exist in a ward or the requested bed is already occupied.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class BedUnavailableException extends RuntimeException {

    public BedUnavailableException(String message) {
        super(message);
    }

    public BedUnavailableException(Long bedId) {
        super(String.format("Bed with id '%d' is currently occupied or unavailable.", bedId));
    }
}

