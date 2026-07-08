// src/main/java/com/kushagra/mediavault/dto/LoginRequest.java
package com.kushagra.mediavault.dto;

import jakarta.validation.constraints.NotBlank;

// Body for POST /api/auth/login. Deliberately loose validation here
// (just @NotBlank) - we don't want to leak info about password rules
// during login attempts, unlike registration where we enforce them.
// If the credentials are wrong, AuthService throws a generic
// "bad credentials" error regardless of which field was actually wrong -
// that's a deliberate security practice, not an oversight.
public record LoginRequest(
    @NotBlank(message = "Username is required")
    String username,

    @NotBlank(message = "Password is required")
    String password
) {
}