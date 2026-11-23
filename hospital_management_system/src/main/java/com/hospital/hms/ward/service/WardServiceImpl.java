package com.hospital.hms.ward.service;

import com.hospital.hms.common.enums.BedStatus;
import com.hospital.hms.common.enums.WardType;
import com.hospital.hms.common.exception.BusinessRuleViolationException;
import com.hospital.hms.common.exception.DuplicateResourceException;
import com.hospital.hms.common.exception.ResourceNotFoundException;
import com.hospital.hms.common.response.PagedResponse;
import com.hospital.hms.ward.dto.WardRequest;
import com.hospital.hms.ward.dto.WardResponse;
import com.hospital.hms.ward.entity.Ward;
import com.hospital.hms.ward.repository.BedRepository;
import com.hospital.hms.ward.repository.WardRepository;
import com.hospital.hms.ward.specification.WardSpecification;
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
 * Implementation of {@link WardService}.
 * <p>
 * All business rules, validation, and data-access logic are strictly here.
 * No business logic exists in the controller.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WardServiceImpl implements WardService {

    private final WardRepository wardRepository;
    private final BedRepository bedRepository;

    // ── Create ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public WardResponse createWard(WardRequest request) {
        log.info("Creating new ward with name: '{}', type: {}", request.getWardName(), request.getWardType());

        if (wardRepository.existsByWardNameIgnoreCase(request.getWardName())) {
            throw new DuplicateResourceException("Ward", "wardName", request.getWardName());
        }

        Ward ward = Ward.builder()
                .wardName(request.getWardName())
                .wardType(request.getWardType())
                .totalCapacity(request.getTotalCapacity())
                .floorNumber(request.getFloorNumber())
                .wing(request.getWing())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Ward saved = wardRepository.save(ward);
        log.info("Ward created successfully with ID: {}", saved.getId());
        return toResponse(saved);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public WardResponse getWardById(Long wardId) {
        log.debug("Fetching ward with ID: {}", wardId);
        Ward ward = findWardOrThrow(wardId);
        return toResponse(ward);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<WardResponse> getAllWards(String name, WardType wardType, Integer floor,
                                                    Boolean isActive, int page, int size,
                                                    String sortBy, String sortDir) {
        log.debug("Fetching wards with filters — name: {}, type: {}, floor: {}, active: {}",
                name, wardType, floor, isActive);

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Ward> spec = WardSpecification.withFilters(name, wardType, floor, isActive);
        Page<Ward> resultPage = wardRepository.findAll(spec, pageable);

        List<WardResponse> content = resultPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(content, resultPage.getNumber(), resultPage.getSize(),
                resultPage.getTotalElements(), resultPage.getTotalPages(), resultPage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WardResponse> getAllActiveWards() {
        return wardRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public WardResponse updateWard(Long wardId, WardRequest request) {
        log.info("Updating ward ID: {}", wardId);
        Ward ward = findWardOrThrow(wardId);

        // Check for name uniqueness if name is being changed
        if (!ward.getWardName().equalsIgnoreCase(request.getWardName())
                && wardRepository.existsByWardNameIgnoreCase(request.getWardName())) {
            throw new DuplicateResourceException("Ward", "wardName", request.getWardName());
        }

        ward.setWardName(request.getWardName());
        ward.setWardType(request.getWardType());
        ward.setTotalCapacity(request.getTotalCapacity());
        ward.setFloorNumber(request.getFloorNumber());
        ward.setWing(request.getWing());
        if (request.getIsActive() != null) {
            ward.setIsActive(request.getIsActive());
        }

        Ward updated = wardRepository.save(ward);
        log.info("Ward ID: {} updated successfully", wardId);
        return toResponse(updated);
    }

    // ── Deactivate ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deactivateWard(Long wardId) {
        log.info("Deactivating ward ID: {}", wardId);
        Ward ward = findWardOrThrow(wardId);

        // Business rule: cannot deactivate a ward with occupied beds
        long occupiedCount = bedRepository.findByWardIdAndStatus(wardId, BedStatus.OCCUPIED).size();
        if (occupiedCount > 0) {
            throw new BusinessRuleViolationException(
                    String.format("Cannot deactivate Ward '%s': %d bed(s) are currently occupied.",
                            ward.getWardName(), occupiedCount));
        }

        ward.setIsActive(false);
        wardRepository.save(ward);
        log.info("Ward '{}' (ID: {}) has been deactivated.", ward.getWardName(), wardId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Ward findWardOrThrow(Long wardId) {
        return wardRepository.findById(wardId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward", "id", wardId));
    }

    /**
     * Maps a Ward entity to its response DTO, enriched with live bed statistics.
     */
    private WardResponse toResponse(Ward ward) {
        long available = bedRepository.findByWardIdAndStatus(ward.getId(), BedStatus.AVAILABLE).size();
        long occupied  = bedRepository.findByWardIdAndStatus(ward.getId(), BedStatus.OCCUPIED).size();

        return WardResponse.builder()
                .id(ward.getId())
                .wardName(ward.getWardName())
                .wardType(ward.getWardType())
                .totalCapacity(ward.getTotalCapacity())
                .floorNumber(ward.getFloorNumber())
                .wing(ward.getWing())
                .isActive(ward.getIsActive())
                .availableBeds(available)
                .occupiedBeds(occupied)
                .createdAt(ward.getCreatedAt())
                .updatedAt(ward.getUpdatedAt())
                .build();
    }
}

