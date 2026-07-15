// src/main/java/com/kushagra/mediavault/service/PosterService.java
package com.kushagra.mediavault.service;

import com.kushagra.mediavault.dto.JikanResponse;
import com.kushagra.mediavault.dto.OmdbResponse;
import com.kushagra.mediavault.dto.RawgResponse;
import com.kushagra.mediavault.entity.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PosterService {

    private final RestClient restClient;

    // @Value fields get injected AFTER the constructor runs, so they
    // can't be used inside it - that's why restClient is built with no
    // arguments here rather than depending on these keys directly. Same
    // pattern as RecommendationService.
    @Value("${omdb.api.key}")
    private String omdbApiKey;

    @Value("${rawg.api.key}")
    private String rawgApiKey;

    public PosterService() {
        this.restClient = RestClient.create();
    }

    // Single entry point MediaService calls. Routes by MediaType using a
    // switch expression (the "yield a value" style, not the old
    // fall-through statement kind) - Java forces you to cover every enum
    // case here, so if you ever add a 5th MediaType, this won't compile
    // until you handle it too.
    //
    // The entire body is wrapped in one try/catch rather than each
    // private method having its own - any failure from any provider
    // funnels through the same "log it, return null" behavior, so a
    // media item ALWAYS saves successfully regardless of what the
    // external API did.
    public String fetchPosterUrl(String title, MediaType type) {
        try {
            return switch (type) {
                case MOVIE, SERIES -> fetchFromOmdb(title);
                case ANIME -> fetchFromJikan(title);
                case GAME -> fetchFromRawg(title);
            };
        } catch (Exception e) {
            System.err.println("Poster lookup failed for '" + title + "': " + e.getMessage());
            return null;
        }
    }

    private String fetchFromOmdb(String title) {
        OmdbResponse response = restClient.get()
            .uri(uriBuilder -> uriBuilder
                .scheme("https")
                .host("www.omdbapi.com")
                .queryParam("t", title)
                .queryParam("apikey", omdbApiKey)
                .build())
            .retrieve()
            .body(OmdbResponse.class);

        if (response == null || !"True".equals(response.Response())) {
            return null;
        }

        // OMDb quirk: a missing poster comes back as the literal string
        // "N/A", not null or an absent field. Easy to miss and end up
        // with broken <img> tags rendering the text "N/A" as a URL.
        String poster = response.Poster();
        return (poster == null || poster.equals("N/A")) ? null : poster;
    }

    private String fetchFromJikan(String title) {
        JikanResponse response = restClient.get()
            .uri(uriBuilder -> uriBuilder
                .scheme("https")
                .host("api.jikan.moe")
                .path("/v4/anime")
                .queryParam("q", title)
                .queryParam("limit", 1)
                .build())
            .retrieve()
            .body(JikanResponse.class);

        if (response == null || response.data() == null || response.data().isEmpty()) {
            return null;
        }

        return response.data().get(0).images().jpg().large_image_url();
    }

    private String fetchFromRawg(String title) {
        RawgResponse response = restClient.get()
            .uri(uriBuilder -> uriBuilder
                .scheme("https")
                .host("api.rawg.io")
                .path("/api/games")
                .queryParam("search", title)
                .queryParam("key", rawgApiKey)
                .build())
            .retrieve()
            .body(RawgResponse.class);

        if (response == null || response.results() == null || response.results().isEmpty()) {
            return null;
        }

        return response.results().get(0).background_image();
    }
}