// src/main/java/com/kushagra/mediavault/dto/LibraryEntryUpdateRequest.java
package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.LibraryStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

// Body for PATCH /api/library/{id} - every field optional, since PATCH means
// "partial update." null means "leave this field unchanged" - the service
// layer only applies fields that come in non-null. tags follows the same
// rule: omit it entirely to leave existing tags untouched, or send a full
// replacement list (including an empty [] to clear all tags).
public record LibraryEntryUpdateRequest(
    LibraryStatus status,

    @Min(value = 1, message = "rating must be between 1 and 10")
    @Max(value = 10, message = "rating must be between 1 and 10")
    Integer rating,

    String notes,

    List<String> tags
) {
}