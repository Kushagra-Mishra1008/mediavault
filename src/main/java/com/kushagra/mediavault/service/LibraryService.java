// src/main/java/com/kushagra/mediavault/service/LibraryService.java
package com.kushagra.mediavault.service;

import com.kushagra.mediavault.dto.LibraryEntryRequest;
import com.kushagra.mediavault.dto.LibraryEntryResponse;
import com.kushagra.mediavault.dto.LibraryEntryUpdateRequest;
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

@Service
public class LibraryService {

    // Phase 1 has no auth yet - every request acts as this hardcoded user.
    // MediavaultApplication seeds this user on startup (next file).
    // Deleted entirely in Phase 2, replaced by the authenticated principal
    // pulled from the JWT.
    private static final Long HARDCODED_USER_ID = 1L;

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
    public LibraryEntryResponse addToLibrary(LibraryEntryRequest request) {
        User user = userRepository.findById(HARDCODED_USER_ID)
            .orElseThrow(() -> new IllegalStateException("Hardcoded seed user missing - check startup seeding"));

        MediaItem mediaItem = mediaItemRepository.findById(request.mediaItemId())
            .orElseThrow(() -> new IllegalArgumentException("Media item not found with id " + request.mediaItemId()));

        libraryEntryRepository.findByUserIdAndMediaItemId(HARDCODED_USER_ID, mediaItem.getId())
            .ifPresent(existing -> {
                throw new IllegalStateException("This media item is already in your library");
            });

        LibraryEntry entry = new LibraryEntry(user, mediaItem, request.status(), request.rating(), request.notes());
        LibraryEntry saved = libraryEntryRepository.save(entry);
        return toResponse(saved);
    }

    @Transactional
    public LibraryEntryResponse updateLibraryEntry(Long id, LibraryEntryUpdateRequest request) {
        LibraryEntry entry = libraryEntryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Library entry not found with id " + id));

        if (request.status() != null) {
            entry.setStatus(request.status());
        }
        if (request.rating() != null) {
            entry.setRating(request.rating());
        }
        if (request.notes() != null) {
            entry.setNotes(request.notes());
        }

        // No explicit save() call needed - within an active @Transactional
        // method, Hibernate tracks changes to a "managed" entity (loaded from
        // the DB in this same transaction) and auto-flushes an UPDATE at the
        // end of the method. This is called "dirty checking."
        return toResponse(entry);
    }

    @Transactional
    public void deleteLibraryEntry(Long id) {
        if (!libraryEntryRepository.existsById(id)) {
            throw new IllegalArgumentException("Library entry not found with id " + id);
        }
        libraryEntryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<LibraryEntryResponse> listLibraryEntries(LibraryStatus status, MediaType type, Pageable pageable) {
        Page<LibraryEntry> page;

        if (status != null && type != null) {
            page = libraryEntryRepository.findByUserIdAndStatusAndMediaItemType(HARDCODED_USER_ID, status, type, pageable);
        } else if (status != null) {
            page = libraryEntryRepository.findByUserIdAndStatus(HARDCODED_USER_ID, status, pageable);
        } else if (type != null) {
            page = libraryEntryRepository.findByUserIdAndMediaItemType(HARDCODED_USER_ID, type, pageable);
        } else {
            page = libraryEntryRepository.findByUserId(HARDCODED_USER_ID, pageable);
        }

        return page.map(this::toResponse);
    }

    // Called WHILE the @Transactional method is still running, so
    // entry.getMediaItem() safely triggers its LAZY fetch here - the
    // session is still open. Doing this conversion in the controller
    // instead would throw LazyInitializationException, since the
    // transaction closes when the service method returns.
    private LibraryEntryResponse toResponse(LibraryEntry entry) {
        MediaItem mi = entry.getMediaItem();
        MediaItemResponse mediaItemResponse = new MediaItemResponse(
            mi.getId(),
            mi.getTitle(),
            mi.getType(),
            mi.getGenre(),
            mi.getReleaseYear(),
            mi.getDescription(),
            mi.getCreatedAt()
        );

        return new LibraryEntryResponse(
            entry.getId(),
            mediaItemResponse,
            entry.getStatus(),
            entry.getRating(),
            entry.getNotes(),
            entry.getAddedAt(),
            entry.getUpdatedAt()
        );
    }
}