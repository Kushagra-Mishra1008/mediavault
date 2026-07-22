// src/main/java/com/kushagra/mediavault/service/PosterService.java
package com.kushagra.mediavault.service;

import com.kushagra.mediavault.dto.AniListRequest;
import com.kushagra.mediavault.dto.AniListResponse;
import com.kushagra.mediavault.dto.OmdbResponse;
import com.kushagra.mediavault.dto.RawgResponse;
import com.kushagra.mediavault.entity.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PosterService {

    // GraphQL query string, defined once as a constant since it never
    // changes between calls - only the variables (search title, type)
    // change per request. "$search: String, $type: MediaType" declares
    // the two variables and their GraphQL types up front, then they're
    // used inside the actual Media(...) call below - same idea as a
    // parameterized SQL query with named placeholders.
    private static final String ANILIST_QUERY = """
        query ($search: String, $type: MediaType) {
          Media (search: $search, type: $type) {
            coverImage {
              large
            }
          }
        }
        """;

    private final RestClient restClient;

    @Value("${omdb.api.key}")
    private String omdbApiKey;

    @Value("${rawg.api.key}")
    private String rawgApiKey;

    public PosterService() {
        this.restClient = RestClient.create();
    }

    public String fetchPosterUrl(String title, MediaType type) {
        try {
            return switch (type) {
                case MOVIE, SERIES -> fetchFromOmdb(title);
                case ANIME -> fetchFromAniList(title, "ANIME");
                case MANGA -> fetchFromAniList(title, "MANGA");
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

        String poster = response.Poster();
        return (poster == null || poster.equals("N/A")) ? null : poster;
    }

    // POST instead of GET, JSON body instead of query params - the
    // AniListRequest record built here gets serialized straight to JSON
    // by Jackson via .body(request), same auto-serialization you've
    // relied on for every @RequestBody in your controllers, just used
    // on the OUTGOING side of a call for once instead of the incoming
    // side.
    private String fetchFromAniList(String title, String type) {
        AniListRequest request = new AniListRequest(
            ANILIST_QUERY,
            new AniListRequest.Variables(title, type)
        );

        AniListResponse response = restClient.post()
            .uri("https://graphql.anilist.co")
            .body(request)
            .retrieve()
            .body(AniListResponse.class);

        if (response == null || response.data() == null || response.data().Media() == null) {
            return null;
        }

        return response.data().Media().coverImage().large();
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