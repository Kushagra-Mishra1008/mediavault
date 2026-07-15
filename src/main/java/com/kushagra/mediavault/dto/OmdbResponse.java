// src/main/java/com/kushagra/mediavault/dto/OmdbResponse.java
package com.kushagra.mediavault.dto;

// Mirrors OMDb's search-by-title response shape (GET /?t=<title>&apikey=...).
// Field names are capitalized because that's literally how OMDb sends
// them in JSON - Jackson maps JSON keys to record fields by name, so
// these have to match exactly (or you'd need @JsonProperty on every
// field to remap them).
public record OmdbResponse(
    String Title,
    String Poster,
    String Response,  // "True" or "False" (as a STRING, not a boolean - OMDb quirk)
    String Error      // present only when Response is "False"
) {
}