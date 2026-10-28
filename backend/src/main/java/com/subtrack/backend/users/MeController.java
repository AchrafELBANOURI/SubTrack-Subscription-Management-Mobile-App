package com.subtrack.backend.users;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final CurrentUserService currentUserService;

    public MeController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        AppUser user = currentUserService.findOrCreate(jwt);
        return new MeResponse(
                user.getId(),
                user.getClerkUserId(),
                user.getEmail(),
                user.getCreatedAt());
    }

    public record MeResponse(
            Long id,
            String clerkUserId,
            String email,
            Instant createdAt) {
    }
}
