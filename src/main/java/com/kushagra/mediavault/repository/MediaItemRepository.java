// src/main/java/com/kushagra/mediavault/repository/MediaItemRepository.java
package com.kushagra.mediavault.repository;

import com.kushagra.mediavault.entity.MediaItem;
import com.kushagra.mediavault.entity.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaItemRepository extends JpaRepository<MediaItem, Long> {

    // Derived query with TWO conditions - Spring parses "By Type And Genre"
    // and ANDs them together:
    // SELECT * FROM media_item WHERE type = ? AND genre = ?
    //
    // Pageable/Page: Spring Data's built-in pagination support. Pageable
    // carries page number + page size + sort info; Page<MediaItem> wraps the
    // result list along with metadata (total pages, total elements, etc).
    // This is what makes GET /api/media?type=&genre=&search= paginated
    // without you writing any LIMIT/OFFSET SQL by hand.
    Page<MediaItem> findByTypeAndGenre(MediaType type, String genre, Pageable pageable);

    Page<MediaItem> findByType(MediaType type, Pageable pageable);

    // "Containing" is a keyword Spring Data recognizes -> generates a LIKE
    // query: SELECT * FROM media_item WHERE title LIKE %?%
    // IgnoreCase adds case-insensitivity to the comparison.
    Page<MediaItem> findByTitleContainingIgnoreCase(String search, Pageable pageable);
}