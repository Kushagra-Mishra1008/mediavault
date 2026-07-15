// src/main/java/com/kushagra/mediavault/entity/MediaItem.java
package com.kushagra.mediavault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "media_item")
public class MediaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType type;

    private String genre;

    private Integer releaseYear;

    @Column(columnDefinition = "TEXT")
    private String description;

    // No @Column(nullable = false) here on purpose - a poster lookup can
    // legitimately fail (title not found, provider down, rate limited),
    // and that should never block the media item itself from being
    // saved. Null just means "no poster art available."
    private String imageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected MediaItem() {
    }

    public MediaItem(String title, MediaType type, String genre, Integer releaseYear, String description) {
        this.title = title;
        this.type = type;
        this.genre = genre;
        this.releaseYear = releaseYear;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public Integer getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(Integer releaseYear) {
        this.releaseYear = releaseYear;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Set by MediaService AFTER construction, once PosterService has
    // resolved (or failed to resolve) a poster URL - not part of the
    // constructor since it's derived data, not something the user
    // submits in MediaItemRequest.
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}