// src/main/java/com/kushagra/mediavault/dto/AniListResponse.java
package com.kushagra.mediavault.dto;

// GraphQL responses always wrap everything in a top-level "data" object -
// that's part of the GraphQL spec itself, not an AniList-specific choice.
// Below that, the shape mirrors exactly what you asked for in the query
// string (next file) - we're requesting Media { coverImage { large } },
// so that's exactly the nesting here. Unlike Jikan's "data" ARRAY (a list
// of search results, take index 0), AniList's "Media" field returns a
// single object directly - the search+type combo is specific enough that
// AniList just gives you its best match, no list to pick from.
public record AniListResponse(
    Data data
) {
    public record Data(
        Media Media
    ) {
    }

    public record Media(
        CoverImage coverImage
    ) {
    }

    // AniList offers multiple image sizes (extraLarge, large, medium,
    // color) - large matches the same "good quality, not excessive" call
    // you made with Jikan's large_image_url.
    public record CoverImage(
        String large
    ) {
    }
}