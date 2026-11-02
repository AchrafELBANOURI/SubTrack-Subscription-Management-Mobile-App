package com.subtrack.backend.users;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.subtrack.backend.users.UserClerkDetails.UserClerkDetailsBuilder;

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
        String jwtFirstName = jwt.getClaimAsString("first_name");
        String jwtLastName = jwt.getClaimAsString("last_name");

        return appUserRepository.findByClerkUserId(clerkUserId)
                .map(existingUser -> tryUpdateFields(existingUser, jwtEmail, jwtFirstName, jwtLastName))
                .orElseGet(() -> resolveAndCreate(clerkUserId, jwtEmail, jwtFirstName, jwtLastName));
    }
    
    @Transactional
    public MeResponse getOrCreateFromJWT(Jwt jwt) {
        AppUser user = findOrCreate(jwt);
        return new MeResponse(
                user.getId(),
                user.getClerkUserId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getCreatedAt());
    }

    private AppUser tryUpdateFields(AppUser user, String jwtEmail, String jwtFistName, String jwtLastName) {
        if (hasValidField(jwtEmail)
                && (!jwtEmail.equals(user.getEmail())
                || hasValidField(jwtFistName) && !jwtFistName.equals(user.getFirstName())
                || hasValidField(jwtLastName) && !jwtLastName.equals(user.getLastName()))) {
            user.updateUserDetails(
                    UserClerkDetailsBuilder.builder()
                            .email(jwtEmail)
                            .firstName(valueOrFallback(jwtFistName, user.getFirstName()))
                            .lastName(valueOrFallback(jwtLastName, user.getLastName()))
                            .build());
        } else if (!hasValidFields(user.getEmail(), user.getFirstName(), user.getLastName())) {
            UserClerkDetails fetched = clerkUserService.fetchUserClerkDetails(user.getClerkUserId());
            if (fetched != null && hasValidFields(fetched.email(), fetched.firstName(), fetched.lastName())) {
                user.updateUserDetails(
                        fetched);
            }
        }
        return user;
    }

    private AppUser resolveAndCreate(String clerkUserId, String jwtEmail, String jwtFistName, String jwtLastName) {
        if (!hasValidFields(jwtEmail, jwtFistName, jwtLastName)) {
            UserClerkDetails fetched = clerkUserService.fetchUserClerkDetails(clerkUserId);
            if (fetched != null) {
                return appUserRepository.save(new AppUser(
                        clerkUserId,
                        valueOrFallback(jwtEmail, fetched.email()),
                        valueOrFallback(jwtFistName, fetched.firstName()),
                        valueOrFallback(jwtLastName, fetched.lastName())));
            }
        }
        return appUserRepository.save(new AppUser(clerkUserId, jwtEmail, jwtFistName, jwtLastName));
    }

    private String valueOrFallback(String value, String fallback) {
        return hasValidField(value) ? value : fallback;
    }

    private boolean hasValidFields(String... fields) {
        for (String field : fields) {
            if (!hasValidField(field)) {
                return false;
            }
        }
        return true;
    }

    private boolean hasValidField(String field) {
        return field != null && !field.isBlank();
    }
}
