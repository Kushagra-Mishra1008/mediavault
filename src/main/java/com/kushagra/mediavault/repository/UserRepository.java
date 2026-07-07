// src/main/java/com/kushagra/mediavault/repository/UserRepository.java
package com.kushagra.mediavault.repository;

import com.kushagra.mediavault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Extending JpaRepository<User, Long> gives us save(), findById(), findAll(),
// deleteById() etc. for free - User is the entity type, Long is the type of
// its @Id field.
//
// Spring Data JPA scans for interfaces like this at startup and generates a
// real implementing class behind the scenes (a dynamic proxy) - we never
// write "implements UserRepository" anywhere ourselves.
public interface UserRepository extends JpaRepository<User, Long> {

    // Method name is parsed as "find by Email" -> Spring generates:
    // SELECT * FROM app_user WHERE email = ?
    // Optional<User> because a user with that email might not exist -
    // forces the caller to explicitly handle the "not found" case rather
    // than risking a null pointer exception.
    Optional<User> findByEmail(String email);

    // Same idea, for login-by-username support later.
    Optional<User> findByUsername(String username);

    // Useful during registration - check existence without loading the full
    // entity. Spring generates: SELECT COUNT(*) > 0 FROM app_user WHERE email = ?
    boolean existsByEmail(String email);
}