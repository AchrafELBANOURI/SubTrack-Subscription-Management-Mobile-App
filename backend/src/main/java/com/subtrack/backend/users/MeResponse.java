package com.subtrack.backend.users;

import java.time.Instant;

public record MeResponse(
        Long id,
        String clerkUserId,
        String email,
        String firstName,
        String lastName,
        Instant createdAt){
}