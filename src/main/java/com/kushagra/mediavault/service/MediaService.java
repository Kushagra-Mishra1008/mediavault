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

@Service
public class MediaService {

    private final MediaItemRepository mediaItemRepository;
    private final PosterService posterService;

    public MediaService(MediaItemRepository mediaItemRepository, PosterService posterService) {
        this.mediaItemRepository = mediaItemRepository;
        this.posterService = posterService;
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

        // Called BEFORE save() so the poster URL is part of the same
        // INSERT, not a separate UPDATE afterward. If this call fails,
        // PosterService already caught it internally and returned null -
        // setImageUrl(null) is harmless, the item just saves without art.
        String imageUrl = posterService.fetchPosterUrl(request.title(), request.type());
        item.setImageUrl(imageUrl);

        MediaItem saved = mediaItemRepository.save(item);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public MediaItemResponse getMediaItemById(Long id) {
        MediaItem item = mediaItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Media item not found with id " + id));
        return toResponse(item);
    }

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
            item.getImageUrl(),
            item.getCreatedAt()
        );
    }
}