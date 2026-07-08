// src/main/java/com/kushagra/mediavault/dto/RecommendationResponse.java
package com.kushagra.mediavault.dto;

import java.util.List;

// What GET /api/recommendations returns - a short list of suggested
// titles based on the user's library, each with a one-line reason. We're
// asking the LLM to return exactly this shape as JSON, then deserializing
// its response straight into this record (see RecommendationService).
public record RecommendationResponse(
    List<Recommendation> recommendations
) {
    public record Recommendation(
        String title,
        String type,
        String reason
    ) {
    }
}