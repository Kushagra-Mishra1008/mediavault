// src/main/java/com/kushagra/mediavault/controller/HealthController.java
package com.kushagra.mediavault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Dedicated ping target for keep-alive services (cron-job.org, UptimeRobot)
// - Render's free tier spins down after 15 min idle, so something needs to
// hit the app periodically. This endpoint is permitAll()'d in SecurityConfig
// (next file) so the ping doesn't need a JWT and always gets a clean 200
// instead of a 401.
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}