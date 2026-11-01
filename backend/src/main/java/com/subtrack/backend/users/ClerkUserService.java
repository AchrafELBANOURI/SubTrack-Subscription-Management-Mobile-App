package com.subtrack.backend.users;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
public class ClerkUserService {

    private static final Logger log = LoggerFactory.getLogger(ClerkUserService.class);

    private final String clerkSecretKey;
    private final RestTemplate restTemplate;

    public ClerkUserService(
            @Value("${clerk.secret-key:}")
            String clerkSecretKey,
            RestTemplateBuilder restTemplateBuilder
    ) {
        this.clerkSecretKey = clerkSecretKey == null ? "" : clerkSecretKey.trim();
        this.restTemplate = restTemplateBuilder
                .connectTimeout(Duration.ofSeconds(10))
                .readTimeout(Duration.ofSeconds(10))
                .build();
    }

    public String fetchUserEmail(String clerkUserId) {
        if (clerkUserId == null || clerkUserId.isBlank()) {
            return null;
        }

        if (clerkSecretKey.isBlank()) {
            log.warn("CLERK_SECRET_KEY is not configured; cannot fetch email for clerkUserId={}", clerkUserId);
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(clerkSecretKey);
            headers.set("Accept", "application/json");

            HttpEntity<Void> request = new HttpEntity<>(headers);
            String url = "https://api.clerk.com/v1/users/" + clerkUserId;

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    request,
                    JsonNode.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode body = response.getBody();
                String primaryEmailId = body.hasNonNull("primary_email_address_id")
                        ? body.get("primary_email_address_id").asText()
                        : null;

                JsonNode emailAddresses = body.get("email_addresses");
                if (emailAddresses != null && emailAddresses.isArray()) {
                    // Try to find the primary email first
                    if (primaryEmailId != null) {
                        for (JsonNode emailNode : emailAddresses) {
                            if (primaryEmailId.equals(emailNode.path("id").asText())) {
                                return emailNode.path("email_address").asText();
                            }
                        }
                    }
                    // Otherwise fallback to the first email address
                    if (emailAddresses.size() > 0) {
                        return emailAddresses.get(0).path("email_address").asText();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch email from Clerk for user {}: {}", clerkUserId, e.getMessage());
        }

        return null;
    }
}
