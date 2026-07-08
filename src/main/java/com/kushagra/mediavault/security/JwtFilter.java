// src/main/java/com/kushagra/mediavault/security/JwtFilter.java
package com.kushagra.mediavault.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// OncePerRequestFilter: a Spring base class guaranteeing this filter's
// logic runs exactly once per incoming request (some request types could
// otherwise pass through the filter chain more than once internally -
// this class protects against that). We extend it and implement
// doFilterInternal(), which IS the actual filter logic.
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    // This method runs for EVERY request that hits the app. filterChain
    // represents "everything that happens after this filter" - the
    // remaining filters, then eventually your controller. We MUST call
    // filterChain.doFilter(request, response) at the end (or the request
    // just dies here and never reaches your controller) - whether or not
    // we found a valid token.
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No header, or it doesn't start with "Bearer " - not our problem
        // to reject here. Just let the request continue unauthenticated;
        // SecurityConfig decides later whether that route even requires
        // auth. This is what lets /api/auth/login and /api/auth/register
        // stay accessible without a token.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Strip the "Bearer " prefix (7 characters) to get the raw token.
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        // Second condition: SecurityContextHolder's authentication being
        // null means "nobody has already authenticated this request in an
        // earlier filter." Without this check, a request could theoretically
        // get double-processed and overwrite a valid authentication - this
        // guards against that.
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.isTokenValid(token, userDetails.getUsername())) {
                // This is the actual "log this request in" step.
                // UsernamePasswordAuthenticationToken is Security's
                // standard object representing "an authenticated identity."
                // We pass null for credentials (the password) since we're
                // not re-checking it here - the JWT signature itself
                // already proved this token is legitimate.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // THIS is the line that actually marks the request as
                // authenticated. Everything downstream - controllers,
                // @AuthenticationPrincipal, method security - reads from
                // this context.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Whether or not we authenticated anyone, always pass control to
        // the next filter/controller. This filter's job is only to try to
        // identify who's calling - not to block anyone. Blocking happens
        // in SecurityConfig based on the route.
        filterChain.doFilter(request, response);
    }
}