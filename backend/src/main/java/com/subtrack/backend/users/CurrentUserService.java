package com.subtrack.backend.users;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {

    private final AppUserRepository appUserRepository;
    private final ClerkUserService clerkUserService;

    public CurrentUserService(
            AppUserRepository appUserRepository,
            ClerkUserService clerkUserService) {
        this.appUserRepository = appUserRepository;
        this.clerkUserService = clerkUserService;
    }

    @Transactional
    public AppUser findOrCreate(Jwt jwt) {
        String clerkUserId = jwt.getSubject();
        String jwtEmail = jwt.getClaimAsString("email");

        return appUserRepository.findByClerkUserId(clerkUserId)
                .map(existingUser -> tryUpdateFields(existingUser, jwtEmail))
                .orElseGet(() -> resolveAndCreate(clerkUserId, jwtEmail));
    }
    
    @Transactional
    public MeResponse getOrCreateFromJWT(Jwt jwt) {
        AppUser user = findOrCreate(jwt);
        return new MeResponse(
                user.getId(),
                user.getClerkUserId(),
                user.getEmail(),
                user.getCreatedAt());
    }

    private AppUser tryUpdateFields(AppUser user, String jwtEmail) {
        if (hasValidEmail(jwtEmail)) {
            if (!jwtEmail.equals(user.getEmail())) {
                user.updateEmail(jwtEmail);
            }
        } else if (!hasValidEmail(user.getEmail())) {
            String fetched = clerkUserService.fetchUserEmail(user.getClerkUserId());
            if (hasValidEmail(fetched)) {
                user.updateEmail(fetched);
            }
        }
        return user;
    }

    private AppUser resolveAndCreate(String clerkUserId, String jwtEmail) {
        if (!hasValidEmail(jwtEmail)) {
            jwtEmail = clerkUserService.fetchUserEmail(clerkUserId);
        }
        return appUserRepository.save(new AppUser(clerkUserId, jwtEmail));
    }

    private boolean hasValidEmail(String email) {
        return email != null && !email.isBlank();
    }
}

