// src/main/java/com/kushagra/mediavault/controller/MediaController.java
package com.kushagra.mediavault.controller;

import com.kushagra.mediavault.dto.MediaItemRequest;
import com.kushagra.mediavault.dto.MediaItemResponse;
import com.kushagra.mediavault.entity.MediaType;
import com.kushagra.mediavault.service.MediaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// @RestController = @Controller + @ResponseBody combined. It marks this
// class as a Spring bean that handles HTTP requests, and tells Spring to
// automatically serialize whatever your methods return (records, in our
// case) directly to JSON in the response body - no manual JSON conversion.
//
// @RequestMapping("/api/media") sets a base path for every method below -
// each method's path is appended to this.
@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    // @PostMapping maps HTTP POST requests to this method.
    // @Valid triggers Bean Validation on the incoming MediaItemRequest -
    // if title is blank or type is null, Spring returns 400 Bad Request
    // automatically, and this method body never even runs.
    // @RequestBody tells Spring to deserialize the JSON request body into
    // a MediaItemRequest object.
    @PostMapping
    public ResponseEntity<MediaItemResponse> createMediaItem(@Valid @RequestBody MediaItemRequest request) {
        MediaItemResponse response = mediaService.createMediaItem(request);
        // ResponseEntity lets us control the exact HTTP status code (201
        // Created is the correct status for a successful POST that creates
        // a resource - not 200 OK, which is the default Spring would use
        // if we just returned the object directly).
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // @PathVariable extracts {id} from the URL and binds it to the id
    // parameter.
    @GetMapping("/{id}")
    public ResponseEntity<MediaItemResponse> getMediaItem(@PathVariable Long id) {
        return ResponseEntity.ok(mediaService.getMediaItemById(id));
    }

    // @RequestParam(required = false) binds query params like ?type=MOVIE
    // - required = false means the param is optional, and since there's no
    // default, it'll be null if not provided, which our service layer
    // already handles (see MediaService.listMediaItems' if/else chain).
    //
    // Pageable as a parameter is special: Spring Data automatically parses
    // query params like ?page=0&size=20&sort=title,asc into a Pageable
    // object for us, with zero manual parsing code.
    @GetMapping
    public ResponseEntity<Page<MediaItemResponse>> listMediaItems(
            @RequestParam(required = false) MediaType type,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(mediaService.listMediaItems(type, genre, search, pageable));
    }
}