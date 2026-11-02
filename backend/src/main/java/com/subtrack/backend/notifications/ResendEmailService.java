package com.subtrack.backend.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.net.URI;

@Service
@ConditionalOnProperty(name = "subtrack.email.provider", havingValue = "resend")
@SuppressWarnings("null")
public class ResendEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailService.class);

    private final RestClient restClient;
    private final RenewalReminderEmailComposer composer;
    private final String apiKey;
    private final String fromEmail;
    private final String fromName;

    public ResendEmailService(
            RestClient.Builder restClientBuilder,
            RenewalReminderEmailComposer composer,
            @Value("${subtrack.email.resend.endpoint:https://api.resend.com/emails}") String endpoint,
            @Value("${subtrack.email.resend.api-key:}") String apiKey,
            @Value("${subtrack.email.from-email:swe.achraf@gmail.com}") String fromEmail,
            @Value("${subtrack.email.from-name:SubTrack}") String fromName) {
        this.restClient = restClientBuilder.build();
        this.composer = composer;
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.endpoint = endpoint;
    }

    private final String endpoint;

    @Override
    public void sendRenewalReminderEmail(
            String recipientEmail,
            String subscriptionName,
            BigDecimal price,
            String currency,
            Instant renewalDate,
            String milestoneLabel) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            throw new EmailDeliveryException(
                "Cannot send renewal reminder email because the recipient email is missing");
        }

        EmailMessage email = composer.compose(recipientEmail, subscriptionName, price, currency,
                renewalDate, milestoneLabel);
        if (apiKey.isBlank()) {
            throw new EmailDeliveryException("RESEND_API_KEY is not configured");
        }

        validateEndpoint();

        try {
            restClient.post()
                .uri(endpoint)
                    .header("Authorization", "Bearer " + apiKey)
                    .body(Objects.requireNonNull(Map.of(
                        "from", Objects.requireNonNull(fromName) + " <" + Objects.requireNonNull(fromEmail) + ">",
                        "to", List.of(Objects.requireNonNull(email.recipientEmail())),
                        "subject", Objects.requireNonNull(email.subject()),
                        "html", Objects.requireNonNull(email.htmlBody()))))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Sent renewal reminder email with Resend to {} for subscription '{}' (milestone: {})",
                    recipientEmail, subscriptionName, milestoneLabel);
        } catch (RestClientException e) {
            log.warn("Failed to deliver Resend email to {}: {}", recipientEmail, e.getMessage());
            throw new EmailDeliveryException("Resend failed to deliver the email", e);
        }
    }

    private void validateEndpoint() {
        try {
            URI uri = URI.create(endpoint);
            String scheme = uri.getScheme();
            if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) {
                log.warn("Invalid RESEND_API_URL: {} must be complete URL such as https://api.resend.com/emails", endpoint);
                throw new EmailDeliveryException(
                        "RESEND_API_URL must be a complete URL such as https://api.resend.com/emails");
            }
        } catch (IllegalArgumentException e) {
            log.warn("Invalid RESEND_API_URL: {} must be complete URL such as https://api.resend.com/emails", endpoint);
            throw new EmailDeliveryException(
                    "RESEND_API_URL must be a complete URL such as https://api.resend.com/emails", e);
        }
    }
}