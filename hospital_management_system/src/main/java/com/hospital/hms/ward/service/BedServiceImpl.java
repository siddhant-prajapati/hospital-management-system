package com.hospital.hms.ward.service;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.BedType;
import com.hospital.hms.common.exception.BedUnavailableException;
import com.hospital.hms.common.exception.BusinessRuleViolationException;
import com.hospital.hms.common.exception.DuplicateResourceException;
import com.hospital.hms.common.exception.ResourceNotFoundException;
import com.hospital.hms.common.response.PagedResponse;
import com.hospital.hms.ward.dto.BedFilterRequest;
import com.hospital.hms.ward.dto.BedRequest;
import com.hospital.hms.ward.dto.BedResponse;
import com.hospital.hms.ward.entity.Bed;
import com.hospital.hms.ward.entity.Ward;
import com.hospital.hms.ward.repository.BedRepository;
import com.hospital.hms.ward.repository.WardRepository;
import com.hospital.hms.ward.specification.BedSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of {@link BedService}.
 * <p>
 * All business rules regarding bed management, occupancy control,
 * and concurrent admission-safe locking live here.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BedServiceImpl implements BedService {

    private final BedRepository bedRepository;
    private final WardRepository wardRepository;
    private final com.hospital.hms.patient.repository.PatientRepository patientRepository;

    // ── Create ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BedResponse addBedToWard(Long wardId, BedRequest request) {
        log.info("Adding bed '{}' to ward ID: {}", request.getBedNumber(), wardId);

        Ward ward = findWardOrThrow(wardId);

        // Business rule: bed number must be unique within a ward
        if (bedRepository.existsByBedNumberAndWardId(request.getBedNumber(), wardId)) {
            throw new DuplicateResourceException(
                    "Bed", "bedNumber", request.getBedNumber() + " in ward " + ward.getWardName());
        }

        // Business rule: cannot exceed the ward's total capacity
        long existingBeds = bedRepository.findByWardId(wardId).size();
        if (existingBeds >= ward.getTotalCapacity()) {
            throw new BusinessRuleViolationException(
                    String.format("Ward '%s' has reached its total capacity of %d beds.",
                            ward.getWardName(), ward.getTotalCapacity()));
        }

        Bed bed = Bed.builder()
                .bedNumber(request.getBedNumber())
                .bedType(request.getBedType() != null ? request.getBedType() : BedType.STANDARD)
                .status(request.getStatus() != null ? request.getStatus() : BedStatus.AVAILABLE)
                .dailyRate(request.getDailyRate())
                .notes(request.getNotes())
                .ward(ward)
                .build();

        Bed saved = bedRepository.save(bed);
        log.info("Bed '{}' added with ID: {} in ward '{}'", saved.getBedNumber(), saved.getId(), ward.getWardName());
        return toResponse(saved);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public BedResponse getBedById(Long bedId) {
        log.debug("Fetching bed with ID: {}", bedId);
        return toResponse(findBedOrThrow(bedId));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BedResponse> getBeds(BedFilterRequest filter) {
        log.debug("Fetching beds with filter: wardId={}, status={}, type={}",
                filter.getWardId(), filter.getStatus(), filter.getBedType());

        Sort sort = filter.getSortDir().equalsIgnoreCase("desc")
                ? Sort.by(filter.getSortBy()).descending()
                : Sort.by(filter.getSortBy()).ascending();
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        // Build a composite Specification from the filter — handles all null-checks internally
        Specification<Bed> spec = BedSpecification.withFilters(
                filter.getWardId(), filter.getStatus(), filter.getBedType());

        // Additionally add wardType filter if provided
        if (filter.getWardType() != null) {
            spec = spec.and(BedSpecification.byWardType(filter.getWardType()));
        }

        Page<Bed> resultPage = bedRepository.findAll(spec, pageable);
        List<BedResponse> content = resultPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(content, resultPage.getNumber(), resultPage.getSize(),
                resultPage.getTotalElements(), resultPage.getTotalPages(), resultPage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BedResponse> getAvailableBedsInWard(Long wardId) {
        findWardOrThrow(wardId); // validate ward exists
        return bedRepository.findByWardIdAndStatus(wardId, BedStatus.AVAILABLE)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BedResponse findFirstAvailableBed(Long wardId, BedType bedType) {
        return bedRepository.findFirstAvailableBedInWard(wardId, bedType)
                .map(this::toResponse)
                .orElseThrow(() -> new BedUnavailableException(
                        String.format("No available %s beds in ward ID: %d", bedType, wardId)));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BedResponse updateBed(Long bedId, BedRequest request) {
        log.info("Updating bed ID: {}", bedId);
        Bed bed = findBedOrThrow(bedId);

        // Business rule: cannot change bed number to one already in use in the same ward
        if (!bed.getBedNumber().equals(request.getBedNumber())
                && bedRepository.existsByBedNumberAndWardId(request.getBedNumber(), bed.getWard().getId())) {
            throw new DuplicateResourceException("Bed", "bedNumber", request.getBedNumber());
        }

        bed.setBedNumber(request.getBedNumber());
        bed.setBedType(request.getBedType());
        bed.setDailyRate(request.getDailyRate());
        bed.setNotes(request.getNotes());
        // Status changes are intentionally handled by dedicated methods (releaseBed, markBedUnderMaintenance)
        // to ensure proper audit and safety checks

        Bed updated = bedRepository.save(bed);
        log.info("Bed ID: {} updated successfully", bedId);
        return toResponse(updated);
    }

    // ── Status transitions ────────────────────────────────────────────────────

    @Override
    @Transactional
    public BedResponse releaseBed(Long bedId) {
        log.info("Releasing bed ID: {} back to AVAILABLE", bedId);
        Bed bed = findBedOrThrow(bedId);

        if (bed.getStatus() == BedStatus.AVAILABLE) {
            throw new BusinessRuleViolationException(
                    "Bed " + bed.getBedNumber() + " is already AVAILABLE.");
        }

        bed.setStatus(BedStatus.AVAILABLE);
        Bed saved = bedRepository.save(bed);
        log.info("Bed '{}' (ID: {}) released to AVAILABLE status", bed.getBedNumber(), bedId);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public BedResponse markBedUnderMaintenance(Long bedId) {
        log.info("Marking bed ID: {} as UNDER_MAINTENANCE", bedId);
        Bed bed = findBedOrThrow(bedId);

        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new BedUnavailableException(
                    "Cannot mark bed " + bed.getBedNumber() + " for maintenance while it is OCCUPIED.");
        }

        bed.setStatus(BedStatus.UNDER_MAINTENANCE);
        Bed saved = bedRepository.save(bed);
        log.info("Bed '{}' (ID: {}) marked UNDER_MAINTENANCE", bed.getBedNumber(), bedId);
        return toResponse(saved);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteBed(Long bedId) {
        log.info("Attempting to delete bed ID: {}", bedId);
        Bed bed = findBedOrThrow(bedId);

        // Business rule: only AVAILABLE beds can be deleted
        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new BusinessRuleViolationException(
                    String.format("Bed '%s' cannot be deleted because its status is %s.",
                            bed.getBedNumber(), bed.getStatus()));
        }

        bedRepository.delete(bed);
        log.info("Bed '{}' (ID: {}) deleted successfully", bed.getBedNumber(), bedId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Bed findBedOrThrow(Long bedId) {
        return bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed", "id", bedId));
    }

    private Ward findWardOrThrow(Long wardId) {
        return wardRepository.findById(wardId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward", "id", wardId));
    }

    private BedResponse toResponse(Bed bed) {
        return BedResponse.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .bedType(bed.getBedType())
                .status(bed.getStatus())
                .dailyRate(bed.getDailyRate())
                .notes(bed.getNotes())
                .wardId(bed.getWard().getId())
                .wardName(bed.getWard().getWardName())
                .wardType(bed.getWard().getWardType() != null ? bed.getWard().getWardType().name() : null)
                .patientId(bed.getPatientId())
                .patientName(bed.getPatientName())
                .createdAt(bed.getCreatedAt())
                .updatedAt(bed.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public BedResponse assignPatient(Long bedId, Long patientId, String patientName) {
        log.info("Assigning patient {} to bed ID: {}", patientId, bedId);
        Bed bed = findBedOrThrow(bedId);
        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new BedUnavailableException("Bed " + bed.getBedNumber() + " is already OCCUPIED.");
        }

        com.hospital.hms.patient.entity.Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        String resolvedName = (patientName != null && !patientName.isBlank())
                ? patientName
                : patient.getName();

        bed.setStatus(BedStatus.OCCUPIED);
        bed.setPatientId(patient.getId());
        bed.setPatientName(resolvedName);
        Bed savedBed = bedRepository.save(bed);

        // Update patient status to Admitted/IPD and link bed
        patient.setStatus(com.hospital.hms.patient.enums.PatientStatus.Admitted);
        patient.setType(com.hospital.hms.patient.enums.VisitType.IPD);
        patient.setAssignedBedId(savedBed.getId());
        patient.setAssignedBedNumber(savedBed.getBedNumber());
        patient.setAssignedWardName(savedBed.getWard() != null ? savedBed.getWard().getWardName() : null);
        patientRepository.save(patient);

        log.info("Bed '{}' assigned to patient '{}'", savedBed.getBedNumber(), patient.getName());
        return toResponse(savedBed);
    }

    @Override
    @Transactional
    public BedResponse releaseToStatus(Long bedId, BedStatus nextStatus) {
        log.info("Releasing bed ID: {} to status {}", bedId, nextStatus);
        Bed bed = findBedOrThrow(bedId);

        if (bed.getPatientId() != null) {
            patientRepository.findById(bed.getPatientId()).ifPresent(p -> {
                p.setStatus(com.hospital.hms.patient.enums.PatientStatus.Discharged);
                p.setAssignedBedId(null);
                p.setAssignedBedNumber(null);
                p.setAssignedWardName(null);
                patientRepository.save(p);
                log.info("Patient '{}' marked as Discharged on bed release", p.getName());
            });
        }

        bed.setStatus(nextStatus);
        bed.setPatientId(null);
        bed.setPatientName(null);
        Bed saved = bedRepository.save(bed);
        return toResponse(saved);
    }
}

