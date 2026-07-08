// src/main/java/com/kushagra/mediavault/security/CustomUserDetailsService.java
package com.kushagra.mediavault.security;

import com.kushagra.mediavault.entity.User;
import com.kushagra.mediavault.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// Implements Spring Security's UserDetailsService interface - the single
// required method, loadUserByUsername(), is Security's hook into "how do I
// find a user in this specific application's database." Security calls
// this internally during the login flow; we never call it ourselves
// directly.
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Security calls this with whatever username was submitted at login.
    // We look it up via the repository method you already have from
    // Phase 1. Note the return type is UserDetails, not User - but since
    // User implements UserDetails, returning a User satisfies this fine.
    //
    // UsernameNotFoundException is a Security-specific exception - throwing
    // it here is how Security knows "no such user" and responds with a
    // generic auth failure (never leaking whether it was username or
    // password that was wrong, for security reasons).
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}