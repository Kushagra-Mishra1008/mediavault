// src/main/java/com/kushagra/mediavault/dto/LibraryEntryUpdateRequest.java
package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.LibraryStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

// Body for PATCH /api/library/{id} - every field optional, since PATCH means
// "partial update." null means "leave this field unchanged" - the service
// layer only applies fields that come in non-null. (No @NotNull anywhere
// here on purpose - that's the whole point of PATCH vs PUT.)
public record LibraryEntryUpdateRequest(
    LibraryStatus status,

    @Min(value = 1, message = "rating must be between 1 and 10")
    @Max(value = 10, message = "rating must be between 1 and 10")
    Integer rating,

    String notes
) {
}