// src/main/java/com/kushagra/mediavault/dto/LibraryEntryRequest.java
package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.LibraryStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

// Body for POST /api/library - adding a media item to your library.
// @Min/@Max on rating enforce the 1-10 range declared in the project spec -
// Spring validates this automatically when the controller method is
// annotated @Valid, before your code even runs.
public record LibraryEntryRequest(
    @NotNull(message = "mediaItemId is required")
    Long mediaItemId,

    @NotNull(message = "status is required")
    LibraryStatus status,

    @Min(value = 1, message = "rating must be between 1 and 10")
    @Max(value = 10, message = "rating must be between 1 and 10")
    Integer rating,

    String notes
) {
}