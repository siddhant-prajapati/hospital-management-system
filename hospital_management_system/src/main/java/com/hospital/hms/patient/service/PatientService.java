package com.hospital.hms.patient.service;

import com.hospital.hms.patient.dto.PatientRequest;
import com.hospital.hms.patient.dto.PatientResponse;

import java.util.List;

public interface PatientService {
    List<PatientResponse> getAllPatients();
    PatientResponse getPatientById(Long id);
    PatientResponse createPatient(PatientRequest request);
    PatientResponse updatePatient(Long id, PatientRequest request);
    void deletePatient(Long id);

    /**
     * Assigns an available bed to a patient, setting patient to Admitted/IPD.
     */
    PatientResponse assignBed(Long patientId, Long bedId);

    /**
     * Discharges a patient, freeing any assigned bed back to Available.
     */
    PatientResponse dischargePatient(Long patientId);
}
