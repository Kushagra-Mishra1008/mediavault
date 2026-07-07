// src/main/java/com/kushagra/mediavault/entity/LibraryEntry.java
package com.kushagra.mediavault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "library_entry",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "media_item_id"})
)
public class LibraryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_item_id", nullable = false)
    private MediaItem mediaItem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LibraryStatus status;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected LibraryEntry() {
    }

    public LibraryEntry(User user, MediaItem mediaItem, LibraryStatus status, Integer rating, String notes) {
        this.user = user;
        this.mediaItem = mediaItem;
        this.status = status;
        this.rating = rating;
        this.notes = notes;
        this.addedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public MediaItem getMediaItem() {
        return mediaItem;
    }

    public LibraryStatus getStatus() {
        return status;
    }

    public void setStatus(LibraryStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
        this.updatedAt = LocalDateTime.now();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}