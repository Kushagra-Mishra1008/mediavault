// src/main/java/com/kushagra/mediavault/dto/JikanResponse.java
package com.kushagra.mediavault.dto;

import java.util.List;

// Mirrors Jikan's anime search response shape (GET /v4/anime?q=<title>).
// Jikan wraps results in a "data" array even though we only ever care
// about the first match - same pattern as GroqChatResponse.choices[0]
// from Phase 3, just a different provider's version of "here's a list,
// you probably want index 0."
public record JikanResponse(
    List<AnimeData> data
) {
    public record AnimeData(
        Images images
    ) {
    }

    public record Images(
        Jpg jpg
    ) {
    }

    // Jikan actually offers multiple image sizes (image_url, small_image_url,
    // large_image_url) - grabbing large_image_url gives better quality for
    // a card-catalog-style cover than the default thumbnail size.
    public record Jpg(
        String large_image_url
    ) {
    }
}