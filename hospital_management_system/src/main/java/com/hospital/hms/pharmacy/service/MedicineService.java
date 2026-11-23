package com.hospital.hms.pharmacy.service;

import com.hospital.hms.pharmacy.dto.MedicineRequest;
import com.hospital.hms.pharmacy.dto.MedicineResponse;

import java.util.List;

public interface MedicineService {
    List<MedicineResponse> getAllMedicines();
    MedicineResponse getMedicineById(Long id);
    MedicineResponse createMedicine(MedicineRequest request);
    MedicineResponse updateMedicine(Long id, MedicineRequest request);
    MedicineResponse updateStock(Long id, int stock);
    void deleteMedicine(Long id);
}
