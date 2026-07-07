// src/main/java/com/kushagra/mediavault/dto/MediaItemRequest.java
package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Body for POST /api/media - creating a new media item.
// @NotBlank/@NotNull are Bean Validation annotations - when a controller
// method parameter is marked @Valid, Spring validates the incoming JSON
// against these BEFORE your method body runs, returning 400 Bad Request
// automatically on failure.
public record MediaItemRequest(

    @NotBlank(message = "Title is required")
    String title,

    @NotNull(message = "Type is required")
    MediaType type,

    String genre,

    Integer releaseYear,

    String description
) {
}