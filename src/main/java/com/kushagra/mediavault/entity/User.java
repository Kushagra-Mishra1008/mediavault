// src/main/java/com/kushagra/mediavault/entity/User.java
package com.kushagra.mediavault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

// implements UserDetails: this is the contract Spring Security's
// authentication machinery talks to. When you log in, Security loads a
// UserDetails object (via a UserDetailsService we'll write next) and calls
// these methods on it to check credentials and account status. Making User
// itself implement the interface means we don't need a separate wrapper
// class - our real DB entity IS the thing Security authenticates against.
@Entity
@Table(name = "app_user")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected User() {
    }

    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ---- UserDetails interface methods below ----
    // These aren't fields - they're Security asking your entity questions
    // at login/request time. We're mapping them onto the fields we already
    // have (or hardcoding sensible defaults, since we're not building
    // account-lockout/expiry features right now).

    // Security's internal name for "roles/permissions this user has." We
    // don't have a roles system yet - every user just gets a flat "USER"
    // authority for now. This is a List<GrantedAuthority>, not a single
    // string - Security expects a collection because real apps often have
    // multiple roles per user (e.g. USER + ADMIN).
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    // Security calls this to get the password hash to compare against
    // what was submitted at login. Note the name - getPassword(), not
    // getPasswordHash() - that's the interface's required method name,
    // we're just returning our existing hash field from it.
    @Override
    public String getPassword() {
        return passwordHash;
    }

    // Security's login flow authenticates by "username" - we're using our
    // existing username field to satisfy that.
    @Override
    public String getUsername() {
        return username;
    }

    // The four booleans below are account-status flags Security checks
    // before allowing login. We're not implementing expiry/lockout
    // features in this project, so we hardcode all of them to "true" =
    // "this account is fine, let it through." If you ever add a "ban
    // user" feature, isAccountNonLocked() is where that logic would live.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}