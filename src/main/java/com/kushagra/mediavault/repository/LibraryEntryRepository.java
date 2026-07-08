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

    // @Query lets us write JPQL directly instead of relying on Spring's
    // method-name parsing - the naming convention can't express "group by
    // and return pairs" on its own. "e" is an alias for LibraryEntry (set
    // in the FROM clause), and e.status/e.user.id reference ENTITY FIELDS,
    // not database columns - Spring translates this to real SQL at
    // runtime, joining/filtering correctly either way.
    //
    // The return type here matters: Object[] because a GROUP BY query
    // returns rows of mixed types (a LibraryStatus enum + a count) - JPA
    // can't map that onto a single entity or DTO automatically, so we get
    // raw rows back and build the Map ourselves in the service layer.
    @Query("SELECT e.status, COUNT(e) FROM LibraryEntry e WHERE e.user.id = :userId GROUP BY e.status")
    List<Object[]> countByStatusGrouped(@Param("userId") Long userId);

    // Same pattern, grouping by the related MediaItem's type instead -
    // e.mediaItem.type walks the relationship, which Spring turns into a
    // JOIN automatically, same as your existing findByUserIdAndMediaItemType
    // derived method already does.
    @Query("SELECT e.mediaItem.type, COUNT(e) FROM LibraryEntry e WHERE e.user.id = :userId GROUP BY e.mediaItem.type")
    List<Object[]> countByTypeGrouped(@Param("userId") Long userId);

    // AVG(e.rating) - straightforward aggregate. Returns Double (boxed,
    // nullable) rather than double, because if the user has zero rated
    // entries, AVG() returns SQL NULL, not 0 - and we want to preserve
    // that "no data" signal rather than lying with a fake 0.0 average.
    @Query("SELECT AVG(e.rating) FROM LibraryEntry e WHERE e.user.id = :userId AND e.rating IS NOT NULL")
    Double findAverageRating(@Param("userId") Long userId);

    long countByUserId(Long userId);
}