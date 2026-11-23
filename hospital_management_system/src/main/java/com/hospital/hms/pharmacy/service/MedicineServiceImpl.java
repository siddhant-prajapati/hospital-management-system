package com.hospital.hms.pharmacy.service;

import com.hospital.hms.common.exception.ResourceNotFoundException;
import com.hospital.hms.pharmacy.dto.MedicineRequest;
import com.hospital.hms.pharmacy.dto.MedicineResponse;
import com.hospital.hms.pharmacy.entity.Medicine;
import com.hospital.hms.pharmacy.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .category(request.getCategory())
                .stock(request.getStock())
                .minThreshold(request.getMinThreshold())
                .unitPrice(request.getUnitPrice())
                .gstRate(request.getGstRate() != null ? request.getGstRate() : java.math.BigDecimal.ZERO)
                .build();
        return toResponse(medicineRepository.save(medicine));
    }

    @Override
    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = findOrThrow(id);
        medicine.setName(request.getName());
        medicine.setCategory(request.getCategory());
        medicine.setStock(request.getStock());
        medicine.setMinThreshold(request.getMinThreshold());
        medicine.setUnitPrice(request.getUnitPrice());
        if (request.getGstRate() != null) medicine.setGstRate(request.getGstRate());
        return toResponse(medicineRepository.save(medicine));
    }

    @Override
    @Transactional
    public MedicineResponse updateStock(Long id, int stock) {
        Medicine medicine = findOrThrow(id);
        medicine.setStock(Math.max(0, stock));
        return toResponse(medicineRepository.save(medicine));
    }

    @Override
    @Transactional
    public void deleteMedicine(Long id) {
        medicineRepository.delete(findOrThrow(id));
    }

    private Medicine findOrThrow(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
    }

    private MedicineResponse toResponse(Medicine m) {
        return MedicineResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .category(m.getCategory())
                .stock(m.getStock())
                .minThreshold(m.getMinThreshold())
                .unitPrice(m.getUnitPrice())
                .gstRate(m.getGstRate())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
