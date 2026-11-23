package com.hospital.hms.patient.service;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.patient.enums.VisitType;
import com.hospital.hms.common.exception.BedUnavailableException;
import com.hospital.hms.common.exception.ResourceNotFoundException;
import com.hospital.hms.patient.dto.PatientRequest;
import com.hospital.hms.patient.dto.PatientResponse;
import com.hospital.hms.patient.entity.Patient;
import com.hospital.hms.patient.enums.PatientStatus;
import com.hospital.hms.patient.repository.PatientRepository;
import com.hospital.hms.ward.entity.Bed;
import com.hospital.hms.ward.repository.BedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final BedRepository bedRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        Patient patient = Patient.builder()
                .name(request.getName())
                .age(request.getAge())
                .gender(request.getGender())
                .phone(request.getPhone())
                .type(request.getType())
                .status(request.getStatus() != null ? request.getStatus() : PatientStatus.Active)
                .build();
        return toResponse(patientRepository.save(patient));
    }

    @Override
    @Transactional
    public PatientResponse updatePatient(Long id, PatientRequest request) {
        Patient patient = findOrThrow(id);
        patient.setName(request.getName());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setType(request.getType());
        if (request.getStatus() != null) {
            patient.setStatus(request.getStatus());
        }
        return toResponse(patientRepository.save(patient));
    }

    @Override
    @Transactional
    public void deletePatient(Long id) {
        Patient patient = findOrThrow(id);
        // Free bed if patient was assigned
        if (patient.getAssignedBedId() != null) {
            bedRepository.findById(patient.getAssignedBedId()).ifPresent(bed -> {
                bed.setStatus(BedStatus.AVAILABLE);
                bed.setPatientId(null);
                bed.setPatientName(null);
                bedRepository.save(bed);
            });
        }
        patientRepository.delete(patient);
    }

    @Override
    @Transactional
    public PatientResponse assignBed(Long patientId, Long bedId) {
        log.info("Assigning bed ID: {} to patient ID: {}", bedId, patientId);
        Patient patient = findOrThrow(patientId);
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed", "id", bedId));

        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new BedUnavailableException("Bed " + bed.getBedNumber() + " is already OCCUPIED.");
        }

        // If patient already has a different bed assigned, free that previous bed
        if (patient.getAssignedBedId() != null && !patient.getAssignedBedId().equals(bedId)) {
            bedRepository.findById(patient.getAssignedBedId()).ifPresent(oldBed -> {
                oldBed.setStatus(BedStatus.AVAILABLE);
                oldBed.setPatientId(null);
                oldBed.setPatientName(null);
                bedRepository.save(oldBed);
            });
        }

        // Update bed
        bed.setStatus(BedStatus.OCCUPIED);
        bed.setPatientId(patient.getId());
        bed.setPatientName(patient.getName());
        Bed savedBed = bedRepository.save(bed);

        // Update patient
        patient.setStatus(PatientStatus.Admitted);
        patient.setType(VisitType.IPD);
        patient.setAssignedBedId(savedBed.getId());
        patient.setAssignedBedNumber(savedBed.getBedNumber());
        patient.setAssignedWardName(savedBed.getWard() != null ? savedBed.getWard().getWardName() : null);
        Patient savedPatient = patientRepository.save(patient);

        log.info("Patient '{}' admitted to bed '{}' in ward '{}'",
                savedPatient.getName(), savedBed.getBedNumber(), savedPatient.getAssignedWardName());

        return toResponse(savedPatient);
    }

    @Override
    @Transactional
    public PatientResponse dischargePatient(Long patientId) {
        log.info("Discharging patient ID: {}", patientId);
        Patient patient = findOrThrow(patientId);

        if (patient.getAssignedBedId() != null) {
            bedRepository.findById(patient.getAssignedBedId()).ifPresent(bed -> {
                bed.setStatus(BedStatus.AVAILABLE);
                bed.setPatientId(null);
                bed.setPatientName(null);
                bedRepository.save(bed);
                log.info("Bed '{}' released to AVAILABLE on patient discharge", bed.getBedNumber());
            });
        }

        patient.setStatus(PatientStatus.Discharged);
        patient.setAssignedBedId(null);
        patient.setAssignedBedNumber(null);
        patient.setAssignedWardName(null);
        Patient savedPatient = patientRepository.save(patient);

        return toResponse(savedPatient);
    }

    private Patient findOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
    }

    private PatientResponse toResponse(Patient p) {
        return PatientResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .age(p.getAge())
                .gender(p.getGender())
                .phone(p.getPhone())
                .type(p.getType())
                .status(p.getStatus())
                .assignedBedId(p.getAssignedBedId())
                .assignedBedNumber(p.getAssignedBedNumber())
                .assignedWardName(p.getAssignedWardName())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
