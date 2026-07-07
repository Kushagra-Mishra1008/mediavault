// src/main/java/com/kushagra/mediavault/controller/LibraryController.java
package com.kushagra.mediavault.controller;

import com.kushagra.mediavault.dto.LibraryEntryRequest;
import com.kushagra.mediavault.dto.LibraryEntryResponse;
import com.kushagra.mediavault.dto.LibraryEntryUpdateRequest;
import com.kushagra.mediavault.entity.LibraryStatus;
import com.kushagra.mediavault.entity.MediaType;
import com.kushagra.mediavault.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @PostMapping
    public ResponseEntity<LibraryEntryResponse> addToLibrary(@Valid @RequestBody LibraryEntryRequest request) {
        LibraryEntryResponse response = libraryService.addToLibrary(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PATCH = partial update. @Valid still applies here - it just means
    // "IF rating is present, it must be 1-10" per LibraryEntryUpdateRequest's
    // annotations. Fields that are simply absent from the JSON stay null
    // and validation doesn't complain about them, since none of those
    // fields are marked @NotNull.
    @PatchMapping("/{id}")
    public ResponseEntity<LibraryEntryResponse> updateLibraryEntry(
            @PathVariable Long id,
            @Valid @RequestBody LibraryEntryUpdateRequest request) {
        return ResponseEntity.ok(libraryService.updateLibraryEntry(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLibraryEntry(@PathVariable Long id) {
        libraryService.deleteLibraryEntry(id);
        // 204 No Content is the correct status for a successful DELETE -
        // there's no body to return, just confirmation it happened.
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<LibraryEntryResponse>> listLibraryEntries(
            @RequestParam(required = false) LibraryStatus status,
            @RequestParam(required = false) MediaType type,
            Pageable pageable) {
        return ResponseEntity.ok(libraryService.listLibraryEntries(status, type, pageable));
    }
}