package com.subtrack.backend.subscriptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LogoDevService {

    private static final Logger log = LoggerFactory.getLogger(LogoDevService.class);

    private static final Map<String, String> DOMAINS_CACHE =
            new ConcurrentHashMap<>();

    @Value("${logo.dev.secret-key}")
    private String secretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String findDomainByName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }

        String normalized = name.trim().toLowerCase();

        return lookup(normalized)
                .orElseGet(() -> searchOnLogoDev(normalized));
    }

    private Optional<String> lookup(String normalizedName) {
        return Optional.ofNullable(DOMAINS_CACHE.get(normalizedName));
    }

    private String searchOnLogoDev(String name) {
        try {
            String url = "https://api.logo.dev/search?q=" +
                    URLEncoder.encode(name, StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(secretKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            ResponseEntity<LogoSearchResult[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    LogoSearchResult[].class
            );

            LogoSearchResult[] results = response.getBody();

            if (results != null &&
                    results.length > 0 &&
                    results[0].domain() != null &&
                    !results[0].domain().isBlank()) {

                String domain = results[0].domain();
                DOMAINS_CACHE.put(name, domain);
                return domain;
            }

            return null;
        } catch (Exception exception) {
            log.error("Logo.dev lookup failed for '{}'", name, exception);
            return null;
        }
    }

    private record LogoSearchResult(
            String name,
            String domain,
            String logo_url
    ) {}
}