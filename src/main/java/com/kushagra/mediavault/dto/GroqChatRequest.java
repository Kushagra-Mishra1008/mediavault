// src/main/java/com/kushagra/mediavault/dto/GroqChatRequest.java
package com.kushagra.mediavault.dto;

import java.util.List;

// Mirrors Groq's OpenAI-compatible /chat/completions request shape.
// Field names match their API spec exactly since Jackson serializes
// these directly to JSON when RestClient sends the request.
public record GroqChatRequest(
    String model,
    List<Message> messages
) {
    public record Message(
        String role,
        String content
    ) {
    }
}