// src/main/java/com/kushagra/mediavault/service/MediaService.java
package com.kushagra.mediavault.service;

import com.kushagra.mediavault.dto.MediaItemRequest;
import com.kushagra.mediavault.dto.MediaItemResponse;
import com.kushagra.mediavault.entity.MediaItem;
import com.kushagra.mediavault.entity.MediaType;
import com.kushagra.mediavault.repository.MediaItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// @Service marks this as a Spring-managed bean - component scanning finds
// it at startup, Spring creates one instance (singleton by default) and
// injects it wherever it's needed.
@Service
public class MediaService {

    private final MediaItemRepository mediaItemRepository;

    // Constructor injection: Spring sees this constructor needs a
    // MediaItemRepository, and automatically passes in the proxy bean
    // Spring Data generated for that interface at startup. No @Autowired
    // needed here since there's only one constructor - Spring infers it.
    public MediaService(MediaItemRepository mediaItemRepository) {
        this.mediaItemRepository = mediaItemRepository;
    }

    @Transactional
    public MediaItemResponse createMediaItem(MediaItemRequest request) {
        MediaItem item = new MediaItem(
            request.title(),
            request.type(),
            request.genre(),
            request.releaseYear(),
            request.description()
        );
        MediaItem saved = mediaItemRepository.save(item);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public MediaItemResponse getMediaItemById(Long id) {
        MediaItem item = mediaItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Media item not found with id " + id));
        return toResponse(item);
    }

    // readOnly = true is a hint to Hibernate that no writes happen in this
    // method, letting it skip some internal dirty-checking overhead. Good
    // practice on every read-only service method.
    @Transactional(readOnly = true)
    public Page<MediaItemResponse> listMediaItems(MediaType type, String genre, String search, Pageable pageable) {
        Page<MediaItem> page;

        if (search != null && !search.isBlank()) {
            page = mediaItemRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else if (type != null && genre != null) {
            page = mediaItemRepository.findByTypeAndGenre(type, genre, pageable);
        } else if (type != null) {
            page = mediaItemRepository.findByType(type, pageable);
        } else {
            page = mediaItemRepository.findAll(pageable);
        }

        // Page.map() converts each MediaItem inside the page to a
        // MediaItemResponse, preserving the pagination metadata (total
        // pages, total elements, etc).
        return page.map(this::toResponse);
    }

    private MediaItemResponse toResponse(MediaItem item) {
        return new MediaItemResponse(
            item.getId(),
            item.getTitle(),
            item.getType(),
            item.getGenre(),
            item.getReleaseYear(),
            item.getDescription(),
            item.getCreatedAt()
        );
    }
}