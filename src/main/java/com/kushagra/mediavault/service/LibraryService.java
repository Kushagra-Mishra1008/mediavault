// src/main/java/com/kushagra/mediavault/service/LibraryService.java
package com.kushagra.mediavault.service;

import com.kushagra.mediavault.dto.LibraryEntryRequest;
import com.kushagra.mediavault.dto.LibraryEntryResponse;
import com.kushagra.mediavault.dto.LibraryEntryUpdateRequest;
import com.kushagra.mediavault.dto.LibraryStatsResponse;
import com.kushagra.mediavault.dto.MediaItemResponse;
import com.kushagra.mediavault.entity.LibraryEntry;
import com.kushagra.mediavault.entity.LibraryStatus;
import com.kushagra.mediavault.entity.MediaItem;
import com.kushagra.mediavault.entity.MediaType;
import com.kushagra.mediavault.entity.User;
import com.kushagra.mediavault.repository.LibraryEntryRepository;
import com.kushagra.mediavault.repository.MediaItemRepository;
import com.kushagra.mediavault.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LibraryService {

    private final LibraryEntryRepository libraryEntryRepository;
    private final MediaItemRepository mediaItemRepository;
    private final UserRepository userRepository;

    public LibraryService(LibraryEntryRepository libraryEntryRepository,
                           MediaItemRepository mediaItemRepository,
                           UserRepository userRepository) {
        this.libraryEntryRepository = libraryEntryRepository;
        this.mediaItemRepository = mediaItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public LibraryEntryResponse addToLibrary(Long userId, LibraryEntryRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found"));

        MediaItem mediaItem = mediaItemRepository.findById(request.mediaItemId())
            .orElseThrow(() -> new IllegalArgumentException("Media item not found with id " + request.mediaItemId()));

        libraryEntryRepository.findByUserIdAndMediaItemId(userId, mediaItem.getId())
            .ifPresent(existing -> {
                throw new IllegalStateException("This media item is already in your library");
            });

        LibraryEntry entry = new LibraryEntry(user, mediaItem, request.status(), request.rating(), request.notes());
        entry.setTags(request.tags() != null ? request.tags() : new ArrayList<>());
        LibraryEntry saved = libraryEntryRepository.save(entry);
        return toResponse(saved);
    }

    @Transactional
    public LibraryEntryResponse updateLibraryEntry(Long userId, Long id, LibraryEntryUpdateRequest request) {
        LibraryEntry entry = libraryEntryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Library entry not found with id " + id));

        if (!entry.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Library entry not found with id " + id);
        }

        if (request.status() != null) {
            entry.setStatus(request.status());
        }
        if (request.rating() != null) {
            entry.setRating(request.rating());
        }
        if (request.notes() != null) {
            entry.setNotes(request.notes());
        }
        if (request.tags() != null) {
            entry.setTags(request.tags());
        }

        return toResponse(entry);
    }

    @Transactional
    public void deleteLibraryEntry(Long userId, Long id) {
        LibraryEntry entry = libraryEntryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Library entry not found with id " + id));

        if (!entry.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Library entry not found with id " + id);
        }

        libraryEntryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<LibraryEntryResponse> listLibraryEntries(Long userId, LibraryStatus status, MediaType type, Pageable pageable) {
        Page<LibraryEntry> page;

        if (status != null && type != null) {
            page = libraryEntryRepository.findByUserIdAndStatusAndMediaItemType(userId, status, type, pageable);
        } else if (status != null) {
            page = libraryEntryRepository.findByUserIdAndStatus(userId, status, pageable);
        } else if (type != null) {
            page = libraryEntryRepository.findByUserIdAndMediaItemType(userId, type, pageable);
        } else {
            page = libraryEntryRepository.findByUserId(userId, pageable);
        }

        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public LibraryStatsResponse getStats(Long userId) {
        long total = libraryEntryRepository.countByUserId(userId);

        Map<LibraryStatus, Long> byStatus = new EnumMap<>(LibraryStatus.class);
        for (Object[] row : libraryEntryRepository.countByStatusGrouped(userId)) {
            byStatus.put((LibraryStatus) row[0], (Long) row[1]);
        }

        Map<MediaType, Long> byType = new EnumMap<>(MediaType.class);
        for (Object[] row : libraryEntryRepository.countByTypeGrouped(userId)) {
            byType.put((MediaType) row[0], (Long) row[1]);
        }

        Double avgRating = libraryEntryRepository.findAverageRating(userId);

        List<Object[]> genreRows = libraryEntryRepository.countByGenreGrouped(userId);
        Map<String, Long> byGenre = new LinkedHashMap<>();
        for (Object[] row : genreRows) {
            byGenre.put((String) row[0], (Long) row[1]);
        }

        String topGenre = genreRows.isEmpty() ? null : (String) genreRows.get(0)[0];

        return new LibraryStatsResponse(total, byStatus, byType, avgRating, byGenre, topGenre);
    }

    // mi.getImageUrl() is the field that was missing - MediaItemResponse
    // picked up an 8th field (imageUrl) back when PosterService was
    // built, but this constructor call never got updated to match. That
    // mismatch is exactly what the compiler error was pointing at:
    // "required 8 args, found 7."
    private LibraryEntryResponse toResponse(LibraryEntry entry) {
        MediaItem mi = entry.getMediaItem();
        MediaItemResponse mediaItemResponse = new MediaItemResponse(
            mi.getId(),
            mi.getTitle(),
            mi.getType(),
            mi.getGenre(),
            mi.getReleaseYear(),
            mi.getDescription(),
            mi.getImageUrl(),
            mi.getCreatedAt()
        );

        return new LibraryEntryResponse(
            entry.getId(),
            mediaItemResponse,
            entry.getStatus(),
            entry.getRating(),
            entry.getNotes(),
            entry.getTags(),
            entry.getAddedAt(),
            entry.getUpdatedAt()
        );
    }
}