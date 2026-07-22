package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.LibraryStatus;
import com.kushagra.mediavault.entity.MediaType;

import java.util.Map;

// byGenre uses a plain Map<String, Long> rather than an EnumMap like
// byStatus/byType - genre is a free-text String field on MediaItem, not
// an enum, so there's no fixed set of keys to pre-allocate. topGenre is
// pulled out separately even though it's technically just byGenre's
// first entry - saves the frontend from having to know "the map is
// ordered, take the first key" as an implicit contract. Null when the
// user has no rated/genre-tagged entries yet, same nullability reasoning
// as averageRating.
public record LibraryStatsResponse(
    long totalEntries,
    Map<LibraryStatus, Long> byStatus,
    Map<MediaType, Long> byType,
    Double averageRating,
    Map<String, Long> byGenre,
    String topGenre
) {
}