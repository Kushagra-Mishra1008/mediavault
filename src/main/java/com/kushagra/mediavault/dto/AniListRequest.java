// src/main/java/com/kushagra/mediavault/dto/AniListRequest.java
package com.kushagra.mediavault.dto;

// GraphQL requests are always POST, always this same envelope shape
// regardless of what you're actually asking for - "query" is the
// GraphQL query string itself (like SQL, but for graphs), "variables"
// is the parameterized values plugged into it. This is DIFFERENT from
// every other provider you've used so far (OMDb/RAWG/Jikan) - those
// were GET requests with values in the URL query string. AniList wants
// them in a JSON request body instead.
public record AniListRequest(
    String query,
    Variables variables
) {
    // "type" here is AniList's own MediaType enum (ANIME or MANGA as
    // literal strings in the query) - unrelated to your own
    // com.kushagra.mediavault.entity.MediaType, just an unfortunate
    // name collision between two different systems' enums.
    public record Variables(
        String search,
        String type
    ) {
    }
}