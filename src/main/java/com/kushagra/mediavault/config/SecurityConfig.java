// src/main/java/com/kushagra/mediavault/config/SecurityConfig.java
package com.kushagra.mediavault.config;

import com.kushagra.mediavault.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// @Configuration: tells Spring "this class defines beans via @Bean methods,
// scan it at startup." Different from @Service/@Component - those mark the
// class ITSELF as a bean; @Configuration marks it as a factory for beans
// built from other (often third-party) classes.
@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // PasswordEncoder bean: BCrypt is the industry-standard password
    // hashing algorithm - slow-by-design (computationally expensive) so
    // brute-forcing leaked hashes is impractical, and it auto-salts each
    // hash so two users with the same password get different hashes.
    // AuthService will inject this bean to hash passwords on register and
    // verify them on login.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager is Security's core interface for "attempt to
    // authenticate these credentials." We expose it as a bean here so
    // AuthService can inject it and call .authenticate() during login -
    // it internally uses your CustomUserDetailsService + PasswordEncoder
    // to actually check the submitted password against the stored hash.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // This is the main event - defines the actual filter chain and route
    // rules. Spring calls this once at startup and uses the returned
    // SecurityFilterChain for every request from then on.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Stateless JWT API - CSRF protection is a cookie/session-based
            // browser attack mitigation and doesn't apply here the same
            // way. Disabling it is standard for token-based APIs, not a
            // security shortcut.
            .csrf(AbstractHttpConfigurer::disable)

            // Never create or use an HTTP session. Every request re-proves
            // identity via its JWT - no "remember this login" server-side
            // state at all.
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Route-level rules, evaluated top to bottom, first match wins.
            .authorizeHttpRequests(auth -> auth
                // Registration/login must be reachable WITHOUT a token -
                // otherwise nobody could ever get their first token.
                .requestMatchers("/api/auth/**").permitAll()
                // Everything else requires a valid, authenticated request.
                .anyRequest().authenticated()
            )

            // Insert our custom filter INTO Spring Security's existing
            // chain, specifically positioned to run BEFORE Security's own
            // built-in username/password filter. This ordering matters:
            // we want to have already set the SecurityContext (if a valid
            // JWT was present) before Security's later authorization check
            // (.anyRequest().authenticated() above) evaluates the request.
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}