// src/main/java/com/kushagra/mediavault/service/AuthService.java
package com.kushagra.mediavault.service;

import com.kushagra.mediavault.dto.AuthResponse;
import com.kushagra.mediavault.dto.LoginRequest;
import com.kushagra.mediavault.dto.RegisterRequest;
import com.kushagra.mediavault.entity.User;
import com.kushagra.mediavault.repository.UserRepository;
import com.kushagra.mediavault.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager,
                        JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("Email already registered");
        }
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new IllegalStateException("Username already taken");
        }

        // encode() runs BCrypt on the plaintext password - this is the
        // ONLY place a plaintext password should ever touch your backend
        // logic. From here on, only the hash exists anywhere.
        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User(request.username(), request.email(), hashedPassword);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        // authenticationManager.authenticate() is where the actual
        // credential check happens. Internally, it calls your
        // CustomUserDetailsService.loadUserByUsername(), then uses the
        // PasswordEncoder bean to compare the submitted plaintext password
        // against the stored hash. If either the username doesn't exist or
        // the password doesn't match, this throws an AuthenticationException
        // (a whole family of exceptions - BadCredentialsException,
        // UsernameNotFoundException, etc) and we never reach the line
        // below it.
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        // If we get here, credentials were valid - now just issue a token.
        String token = jwtUtil.generateToken(request.username());
        return new AuthResponse(token, request.username());
    }
}