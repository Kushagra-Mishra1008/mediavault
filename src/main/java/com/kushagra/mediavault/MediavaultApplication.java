// src/main/java/com/kushagra/mediavault/MediavaultApplication.java
package com.kushagra.mediavault;

import com.kushagra.mediavault.entity.User;
import com.kushagra.mediavault.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MediavaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediavaultApplication.class, args);
    }

    // @Bean tells Spring "call this method once at startup and register
    // whatever it returns as a managed bean." Here the bean is a
    // CommandLineRunner - a functional interface Spring Boot automatically
    // executes right after the application context finishes loading, i.e.
    // right after all your beans (repositories, services) are ready to use.
    //
    // We use it here to seed a single hardcoded user (id=1) so that
    // LibraryService's HARDCODED_USER_ID = 1L actually resolves to a real
    // row in Phase 1, before real auth/registration exists.
    //
    // userRepository is passed in as a method parameter - Spring sees this
    // @Bean method needs a UserRepository and injects it automatically,
    // same dependency injection mechanism as constructor injection in
    // @Service classes.
    @Bean
    CommandLineRunner seedData(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User seedUser = new User("kushagra", "kushagra@example.com", "placeholder-hash");
                userRepository.save(seedUser);
                System.out.println("Seeded default user with id=1 for Phase 1 development");
            }
        };
    }
}