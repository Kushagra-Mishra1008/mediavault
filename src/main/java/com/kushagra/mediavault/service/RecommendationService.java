// src/main/java/com/kushagra/mediavault/service/RecommendationService.java
package com.kushagra.mediavault.service;

import com.kushagra.mediavault.dto.GroqChatRequest;
import com.kushagra.mediavault.dto.GroqChatResponse;
import com.kushagra.mediavault.dto.RecommendationResponse;
import com.kushagra.mediavault.entity.LibraryEntry;
import com.kushagra.mediavault.repository.LibraryEntryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final LibraryEntryRepository libraryEntryRepository;
    private final RestClient restClient;
    private final JsonMapper jsonMapper;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.model}")
    private String model;

    public RecommendationService(LibraryEntryRepository libraryEntryRepository) {
        this.libraryEntryRepository = libraryEntryRepository;
        this.restClient = RestClient.create();
        this.jsonMapper = JsonMapper.builder().build();
    }

    @Transactional(readOnly = true)
    public RecommendationResponse getRecommendations(Long userId) {
        List<LibraryEntry> entries = libraryEntryRepository
            .findByUserId(userId, Pageable.unpaged())
            .getContent();

        if (entries.isEmpty()) {
            throw new IllegalStateException("Add some items to your library first to get recommendations");
        }

        String prompt = buildPrompt(entries);
        String rawContent = callGroq(prompt);
        return parseRecommendations(rawContent);
    }

    private String buildPrompt(List<LibraryEntry> entries) {
        String librarySummary = entries.stream()
            .map(e -> String.format("- %s (%s), status: %s, rating: %s",
                e.getMediaItem().getTitle(),
                e.getMediaItem().getType(),
                e.getStatus(),
                e.getRating() != null ? e.getRating() : "unrated"))
            .collect(Collectors.joining("\n"));

        return """
            Based on this user's media library, suggest 3 new movies, series, \
            anime, manga, or games they would likely enjoy. Do not suggest \
            titles already in their library.

            Their library:
            %s

            Respond with ONLY valid JSON, no other text, in exactly this shape:
            {"recommendations": [{"title": "...", "type": "MOVIE|SERIES|ANIME|GAME|MANGA", "reason": "...", "confidence": 87.5}]}

            confidence is a number from 0 to 100 representing how strong a \
            fit the suggestion is for this specific library - not a string, \
            no percent sign.
            """.formatted(librarySummary);
    }

    private String callGroq(String prompt) {
        GroqChatRequest request = new GroqChatRequest(
            model,
            List.of(new GroqChatRequest.Message("user", prompt))
        );

        GroqChatResponse response = restClient.post()
            .uri("https://api.groq.com/openai/v1/chat/completions")
            .header("Authorization", "Bearer " + apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .body(request)
            .retrieve()
            .body(GroqChatResponse.class);

        if (response == null || response.choices().isEmpty()) {
            throw new IllegalStateException("Received empty response from recommendation service");
        }

        return response.choices().get(0).message().content();
    }

    private RecommendationResponse parseRecommendations(String rawContent) {
        try {
            String cleaned = rawContent.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```json\\s*", "").replaceAll("```$", "").trim();
            }
            return jsonMapper.readValue(cleaned, RecommendationResponse.class);
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse recommendation response: " + e.getMessage());
        }
    }
}