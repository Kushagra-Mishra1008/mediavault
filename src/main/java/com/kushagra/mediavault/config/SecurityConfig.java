// src/main/java/com/kushagra/mediavault/config/SecurityConfig.java
package com.kushagra.mediavault.config;

import com.kushagra.mediavault.security.JwtFilter;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    // Same ${VAR:default} pattern as application.properties - locally this
    // is just your Vite dev server (localhost:5173), so nothing changes
    // for local development. In Render's dashboard, we'll set this to your
    // real deployed frontend URL once you know it. Comma-separated so both
    // your local dev URL AND the production frontend URL can be allowed at
    // once, if you ever want to test against the live backend from your
    // local machine.
    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // CORS = Cross-Origin Resource Sharing. Browsers block JavaScript from
    // one origin (protocol+domain+port) from calling an API on a DIFFERENT
    // origin, unless that API explicitly says "this origin is allowed" via
    // response headers. In dev, Vite's proxy made your frontend and backend
    // LOOK same-origin to the browser (see vite.config.js's server.proxy),
    // so this was never an issue. In production, your frontend (e.g. a
    // Vercel URL) and backend (a Render URL) are genuinely different
    // origins - without this bean, every fetch() call from the deployed
    // frontend would be silently blocked by the browser, even though the
    // backend itself would have handled the request fine.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE", "OPTIONS"));
        // Authorization is the header your JWT rides in on every request
        // (see JwtFilter) - without explicitly allowing it here, the
        // browser's CORS preflight would strip it or block the request.
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}