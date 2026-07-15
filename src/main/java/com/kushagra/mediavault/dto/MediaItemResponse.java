// src/main/java/com/kushagra/mediavault/dto/MediaItemResponse.java
package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.MediaType;
import java.time.LocalDateTime;

// What we send back for a MediaItem - never the entity itself. imageUrl
// added here mirrors the new MediaItem field - nullable, since a failed
// poster lookup means the frontend gets null and falls back to its
// colored-placeholder card design instead of a broken <img> tag.
public record MediaItemResponse(
    Long id,
    String title,
    MediaType type,
    String genre,
    Integer releaseYear,
    String description,
    String imageUrl,
    LocalDateTime createdAt
) {
}