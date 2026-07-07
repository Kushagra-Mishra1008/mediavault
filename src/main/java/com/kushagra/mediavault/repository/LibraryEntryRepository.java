// src/main/java/com/kushagra/mediavault/repository/LibraryEntryRepository.java
package com.kushagra.mediavault.repository;

import com.kushagra.mediavault.entity.LibraryEntry;
import com.kushagra.mediavault.entity.LibraryStatus;
import com.kushagra.mediavault.entity.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LibraryEntryRepository extends JpaRepository<LibraryEntry, Long> {

    Page<LibraryEntry> findByUserId(Long userId, Pageable pageable);

    Page<LibraryEntry> findByUserIdAndStatus(Long userId, LibraryStatus status, Pageable pageable);

    Optional<LibraryEntry> findByUserIdAndMediaItemId(Long userId, Long mediaItemId);

    long countByUserIdAndStatus(Long userId, LibraryStatus status);

    // Spring Data resolves "MediaItemType" by walking the nested relationship:
    // LibraryEntry.mediaItem.type -> generates a JOIN on media_item, filtered
    // on its type column.
    Page<LibraryEntry> findByUserIdAndMediaItemType(Long userId, MediaType type, Pageable pageable);

    Page<LibraryEntry> findByUserIdAndStatusAndMediaItemType(Long userId, LibraryStatus status, MediaType type, Pageable pageable);
}