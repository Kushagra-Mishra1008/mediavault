package com.kushagra.mediavault.dto;

import com.kushagra.mediavault.entity.LibraryStatus;
import com.kushagra.mediavault.entity.MediaType;

import java.util.Map;

public record LibraryStatsResponse(
    long totalEntries,
    Map<LibraryStatus, Long> byStatus,
    Map<MediaType, Long> byType,
    Double averageRating
) {
}