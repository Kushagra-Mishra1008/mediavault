// src/main/java/com/kushagra/mediavault/dto/AuthResponse.java
package com.kushagra.mediavault.dto;

// What we send back after a successful register or login. The frontend
// stores this token (localStorage, cookie, wherever) and attaches it as
// "Authorization: Bearer <token>" on every subsequent request. tokenType
// is included so the client knows exactly how to format that header -
// "Bearer" is the standard scheme name for JWT-style tokens.
public record AuthResponse(
    String token,
    String tokenType,
    String username
) {
    // Convenience constructor - every token we ever issue is a Bearer
    // token, so callers shouldn't have to type that literal string every
    // time they build one of these.
    public AuthResponse(String token, String username) {
        this(token, "Bearer", username);
    }
}