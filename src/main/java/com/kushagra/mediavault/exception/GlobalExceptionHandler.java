// src/main/java/com/kushagra/mediavault/exception/GlobalExceptionHandler.java
package com.kushagra.mediavault.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

// @RestControllerAdvice = @ControllerAdvice + @ResponseBody combined,
// same relationship as @RestController to @Controller. Spring scans this
// once at startup and wires it to intercept uncaught exceptions from
// EVERY @RestController in the app - MediaController, LibraryController,
// AuthController, all of them - without any of those classes needing to
// know this exists.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Catches IllegalStateException specifically - this is what
    // AuthService throws for "email already registered" / "username
    // already taken", and what LibraryService throws for "already in your
    // library". 409 Conflict is the correct HTTP status for "this request
    // is valid, but conflicts with existing state" - distinct from 400
    // (malformed request) or 404 (not found).
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    // Catches IllegalArgumentException - what MediaService/LibraryService
    // throw for "not found with id X". 404 is correct here - the request
    // was well-formed, but the resource being asked for doesn't exist.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // Catches Spring Security's whole family of authentication failures
    // (BadCredentialsException, UsernameNotFoundException during login,
    // etc - they all extend AuthenticationException). This is what makes
    // AuthService.login() fail cleanly with 401 instead of an ugly
    // default error when credentials are wrong.
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }

    // Catch-all safety net - anything not covered above still gets a
    // clean JSON error instead of Spring's default HTML error page or a
    // raw stack trace leaking to the client. Logged server-side so you
    // can still debug it, but the client just sees a generic 500.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        ex.printStackTrace();
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
    }

    // Shared helper - builds a consistent error JSON shape across every
    // handler above: {"timestamp": ..., "status": ..., "message": ...}
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}