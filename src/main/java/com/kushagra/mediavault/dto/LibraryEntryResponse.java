// src/main/java/com/kushagra/mediavault/dto/LibraryEntryResponse.java
package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.LibraryStatus;
import java.time.LocalDateTime;
import java.util.List;

// Nests the full MediaItemResponse instead of just a mediaItemId - saves
// the frontend a second API call to show the title/type/etc alongside each
// library entry. This is a deliberate DTO shaping decision - the entity
// doesn't look like this, we're just choosing what's convenient for the API
// consumer.
public record LibraryEntryResponse(
    Long id,
    MediaItemResponse mediaItem,
    LibraryStatus status,
    Integer rating,
    String notes,
    List<String> tags,
    LocalDateTime addedAt,
    LocalDateTime updatedAt
) {
}