package com.kushagra.mediavault.repository;

import com.kushagra.mediavault.entity.LibraryEntry;
import com.kushagra.mediavault.entity.LibraryStatus;
import com.kushagra.mediavault.entity.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LibraryEntryRepository extends JpaRepository<LibraryEntry, Long> {

    Page<LibraryEntry> findByUserId(Long userId, Pageable pageable);

    Page<LibraryEntry> findByUserIdAndStatus(Long userId, LibraryStatus status, Pageable pageable);

    Optional<LibraryEntry> findByUserIdAndMediaItemId(Long userId, Long mediaItemId);

    long countByUserIdAndStatus(Long userId, LibraryStatus status);

    Page<LibraryEntry> findByUserIdAndMediaItemType(Long userId, MediaType type, Pageable pageable);

    Page<LibraryEntry> findByUserIdAndStatusAndMediaItemType(Long userId, LibraryStatus status, MediaType type, Pageable pageable);

    // --- Phase 3: stats aggregation queries ---

    @Query("SELECT e.status, COUNT(e) FROM LibraryEntry e WHERE e.user.id = :userId GROUP BY e.status")
    List<Object[]> countByStatusGrouped(@Param("userId") Long userId);

    @Query("SELECT e.mediaItem.type, COUNT(e) FROM LibraryEntry e WHERE e.user.id = :userId GROUP BY e.mediaItem.type")
    List<Object[]> countByTypeGrouped(@Param("userId") Long userId);

    @Query("SELECT AVG(e.rating) FROM LibraryEntry e WHERE e.user.id = :userId AND e.rating IS NOT NULL")
    Double findAverageRating(@Param("userId") Long userId);

    long countByUserId(Long userId);

    // --- Persona 5 redesign: genre aggregation ---

    // Same GROUP BY / Object[] pattern as the status and type queries
    // above - genre lives on the related MediaItem, not LibraryEntry
    // itself, so e.mediaItem.genre walks the relationship same as
    // countByTypeGrouped does for type. WHERE e.mediaItem.genre IS NOT
    // NULL matters here specifically because genre is an optional field
    // on MediaItem (unlike type, which is @Column(nullable = false)) -
    // without this filter, untagged items would show up as a "null"
    // genre bucket in the results, which is meaningless to display.
    // ORDER BY COUNT(e) DESC means the first row IS the top genre - the
    // service layer just needs row[0] of the first result, no separate
    // query needed for "top genre" specifically.
    @Query("SELECT e.mediaItem.genre, COUNT(e) FROM LibraryEntry e " +
           "WHERE e.user.id = :userId AND e.mediaItem.genre IS NOT NULL " +
           "GROUP BY e.mediaItem.genre ORDER BY COUNT(e) DESC")
    List<Object[]> countByGenreGrouped(@Param("userId") Long userId);
}