// src/main/java/com/kushagra/mediavault/dto/RecommendationResponse.java
package com.kushagra.mediavault.dto;

import java.util.List;

// What GET /api/recommendations returns - a short list of suggested
// titles based on the user's library, each with a one-line reason and a
// confidence score. We're asking the LLM to return exactly this shape as
// JSON, then deserializing its response straight into this record (see
// RecommendationService).
public record RecommendationResponse(
    List<Recommendation> recommendations
) {
    // confidence is a Double, not a primitive double, and not validated
    // or clamped anywhere - it's the LLM's own self-reported number, not
    // a computed statistic. Worth being honest with yourself about this
    // one: it's flavor text with a numeric costume on. Groq isn't running
    // a real similarity model against your library; it's a language
    // model asked to output a plausible-looking percentage in the same
    // response as the recommendation. Treat it as "the model's stated
    // confidence," not "measured match probability" - fine for the UI
    // treatment you're going for, just don't build any real logic
    // (sorting thresholds, filtering) on top of it that assumes it's
    // calibrated.
    public record Recommendation(
        String title,
        String type,
        String reason,
        Double confidence
    ) {
    }
}