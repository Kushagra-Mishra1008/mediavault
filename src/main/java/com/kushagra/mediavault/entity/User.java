package com.kushagra.mediavault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Entity
@Table(name = "app_user")
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

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

    public User(String username, String email, String passwordHash){
        this.username=username;
        this.email=email;
        this.passwordHash=passwordHash;
        this.createdAt=LocalDateTime.now();
    }
        public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
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

}