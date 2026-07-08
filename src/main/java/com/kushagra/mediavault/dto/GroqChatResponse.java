// src/main/java/com/kushagra/mediavault/dto/GroqChatResponse.java
package com.kushagra.mediavault.dto;

import java.util.List;

// Mirrors Groq's OpenAI-compatible response shape. The actual reply text
// is buried inside choices[0].message.content - this nested structure
// exists because the API technically supports returning multiple
// candidate responses (n > 1), even though we'll only ever use the first
// one. Jackson deserializes the incoming JSON straight into this record
// tree automatically - we never manually parse JSON strings ourselves.
public record GroqChatResponse(
    List<Choice> choices
) {
    public record Choice(
        Message message
    ) {
    }

    public record Message(
        String role,
        String content
    ) {
    }
}