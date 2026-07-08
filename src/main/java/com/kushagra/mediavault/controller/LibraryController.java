// src/main/java/com/kushagra/mediavault/controller/LibraryController.java
package com.kushagra.mediavault.controller;

import com.kushagra.mediavault.dto.LibraryEntryRequest;
import com.kushagra.mediavault.dto.LibraryEntryResponse;
import com.kushagra.mediavault.dto.LibraryEntryUpdateRequest;
import com.kushagra.mediavault.dto.LibraryStatsResponse;
import com.kushagra.mediavault.entity.LibraryStatus;
import com.kushagra.mediavault.entity.MediaType;
import com.kushagra.mediavault.entity.User;
import com.kushagra.mediavault.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @PostMapping("/library")
    public ResponseEntity<LibraryEntryResponse> addToLibrary(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody LibraryEntryRequest request) {
        LibraryEntryResponse response = libraryService.addToLibrary(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/library/{id}")
    public ResponseEntity<LibraryEntryResponse> updateLibraryEntry(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody LibraryEntryUpdateRequest request) {
        return ResponseEntity.ok(libraryService.updateLibraryEntry(user.getId(), id, request));
    }

    @DeleteMapping("/library/{id}")
    public ResponseEntity<Void> deleteLibraryEntry(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        libraryService.deleteLibraryEntry(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/library")
    public ResponseEntity<Page<LibraryEntryResponse>> listLibraryEntries(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) LibraryStatus status,
            @RequestParam(required = false) MediaType type,
            Pageable pageable) {
        return ResponseEntity.ok(libraryService.listLibraryEntries(user.getId(), status, type, pageable));
    }

    // New Phase 3 endpoint. Sits at /api/stats, not /api/library/stats -
    // that's why @RequestMapping moved up to just "/api" at the class
    // level, with each method now spelling out its own full sub-path
    // (/library, /library/{id}, /stats) instead of inheriting a shared
    // /api/library prefix. Small structural change, worth noticing.
    @GetMapping("/stats")
    public ResponseEntity<LibraryStatsResponse> getStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(libraryService.getStats(user.getId()));
    }
}