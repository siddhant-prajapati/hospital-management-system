package com.hospital.hms.ward.specification;

import com.hospital.hms.common.enums.WardType;
import com.hospital.hms.ward.entity.Ward;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/**
 * JPA Specification builders for Ward filtering.
 */
public final class WardSpecification {

    private WardSpecification() {}

    public static Specification<Ward> byWardType(WardType wardType) {
        return (root, query, cb) -> {
            if (wardType == null) return cb.conjunction();
            return cb.equal(root.get("wardType"), wardType);
        };
    }

    public static Specification<Ward> byWardNameContaining(String name) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(name)) return cb.conjunction();
            return cb.like(cb.lower(root.get("wardName")), "%" + name.toLowerCase() + "%");
        };
    }

    public static Specification<Ward> byIsActive(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) return cb.conjunction();
            return cb.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<Ward> byFloor(Integer floorNumber) {
        return (root, query, cb) -> {
            if (floorNumber == null) return cb.conjunction();
            return cb.equal(root.get("floorNumber"), floorNumber);
        };
    }

    public static Specification<Ward> withFilters(String name, WardType wardType, Integer floor, Boolean isActive) {
        return Specification
                .where(byWardNameContaining(name))
                .and(byWardType(wardType))
                .and(byFloor(floor))
                .and(byIsActive(isActive));
    }
}

