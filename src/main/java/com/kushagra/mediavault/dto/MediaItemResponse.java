// src/main/java/com/kushagra/mediavault/dto/MediaItemResponse.java
package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.MediaType;
import java.time.LocalDateTime;

// What we send back for a MediaItem - never the entity itself. Same shape
// as the entity's fields here, but that won't always be true (e.g. we might
// later add a computed field like "isInMyLibrary" that has no entity column).
public record MediaItemResponse(
    Long id,
    String title,
    MediaType type,
    String genre,
    Integer releaseYear,
    String description,
    LocalDateTime createdAt
) {
}