// src/main/java/com/kushagra/mediavault/dto/RawgResponse.java
package com.kushagra.mediavault.dto;

import java.util.List;

// Mirrors RAWG's game search response shape (GET /api/games?search=<title>).
// "results" instead of "data" or "choices" - every provider names its
// wrapper array something different, which is exactly why PosterService
// needs a separate method per provider rather than one generic handler.
public record RawgResponse(
    List<GameResult> results
) {
    public record GameResult(
        String background_image
    ) {
    }
}