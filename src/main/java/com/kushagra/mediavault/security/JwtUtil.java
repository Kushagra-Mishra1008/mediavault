// src/main/java/com/kushagra/mediavault/security/JwtUtil.java
package com.kushagra.mediavault.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

// @Component: generic "this is a Spring-managed bean" annotation - same
// idea as @Service/@Repository, just used when a class doesn't fit those
// more specific roles. Spring creates one instance of this and injects it
// wherever needed (we'll inject it into JwtFilter and AuthService soon).
@Component
public class JwtUtil {

    // @Value pulls this from application.properties at startup, e.g.:
    // jwt.secret=some-long-random-string-at-least-32-chars
    // Never hardcode the secret in code - if it leaks (like your DB
    // password did), anyone can forge valid tokens for any user.
    @Value("${jwt.secret}")
    private String secretKey;

    // Token lifetime in milliseconds. 24 hours here - also pulled from
    // properties so you can tune it without a code change.
    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    // Converts the raw secret string into a proper cryptographic SecretKey
    // object - jjwt won't accept a plain String, it needs bytes wrapped in
    // this type for the signing algorithm (HMAC-SHA) to use.
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Builds and signs a new token for the given username. This is called
    // once, right after a successful login/register.
    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
            .subject(username)          // "subject" = who this token belongs to
            .issuedAt(now)
            .expiration(expiry)
            .signWith(getSigningKey())  // signs it - this is what makes it tamper-proof
            .compact();                 // serializes to the final string format
    }

    // Pulls the username back out of a token - called by JwtFilter on
    // every incoming request to figure out who's making it.
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Generic helper - parses the token once, then lets the caller pull
    // whatever specific claim they want out of it via a function reference
    // (Claims::getSubject, Claims::getExpiration, etc). Avoids re-parsing
    // the token separately for every different piece of data you need.
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())   // verifies the signature matches -
                                            // throws if the token was tampered with
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return claimsResolver.apply(claims);
    }

    // Called by JwtFilter to decide whether to trust this token. Checks
    // two things: the username in the token matches who we expect, AND
    // the token hasn't expired.
    public boolean isTokenValid(String token, String expectedUsername) {
        String username = extractUsername(token);
        return username.equals(expectedUsername) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}