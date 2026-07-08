// src/main/java/com/kushagra/mediavault/dto/RegisterRequest.java
package com.kushagra.mediavault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Body for POST /api/auth/register. Same Bean Validation pattern you
// already know from MediaItemRequest - @NotBlank/@Email/@Size run
// automatically when the controller method is @Valid, before your code
// executes. Note: this takes a raw plaintext password, NOT a hash - the
// hashing happens server-side in AuthService using BCrypt. The client
// should never send or see a hash.
public record RegisterRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password
) {
}