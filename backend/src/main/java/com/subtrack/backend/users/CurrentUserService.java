package com.subtrack.backend.users;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {

    private final AppUserRepository appUserRepository;

    public CurrentUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public AppUser findOrCreate(Jwt jwt) {
        String clerkUserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");

        return appUserRepository.findByClerkUserId(clerkUserId)
                .map(existingUser -> {
                    if (email != null && !email.equals(existingUser.getEmail())) {
                        existingUser.updateEmail(email);
                    }
                    return existingUser;
                })
                .orElseGet(() -> appUserRepository.save(
                        new AppUser(clerkUserId, email)));
    }
}
