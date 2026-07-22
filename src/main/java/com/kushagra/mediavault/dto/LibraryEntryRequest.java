// src/main/java/com/kushagra/mediavault/dto/LibraryEntryRequest.java
package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.LibraryStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

// Body for POST /api/library - adding a media item to your library.
// tags is optional (no @NotNull) - a fresh entry might not have any yet.
// null here just means "no tags provided", handled as empty in the service.
public record LibraryEntryRequest(
    @NotNull(message = "mediaItemId is required")
    Long mediaItemId,

    @NotNull(message = "status is required")
    LibraryStatus status,

    @Min(value = 1, message = "rating must be between 1 and 10")
    @Max(value = 10, message = "rating must be between 1 and 10")
    Integer rating,

    String notes,

    List<String> tags
) {
}