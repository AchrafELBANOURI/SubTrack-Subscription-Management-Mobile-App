package com.subtrack.backend.notifications;

import jakarta.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Service
@ConditionalOnProperty(name = "subtrack.email.provider", havingValue = "smtp", matchIfMissing = true)
@SuppressWarnings("null")
public class SmtpEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final RenewalReminderEmailComposer composer;
    private final String fromEmail;
    private final String fromName;

    public SmtpEmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            RenewalReminderEmailComposer composer,
            @Value("${subtrack.email.from-email:swe.achraf@gmail.com}") String fromEmail,
            @Value("${subtrack.email.from-name:SubTrack}") String fromName) {
        this.mailSenderProvider = mailSenderProvider;
        this.composer = composer;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    @Override
    public void sendRenewalReminderEmail(
            String recipientEmail,
            String subscriptionName,
            BigDecimal price,
            String currency,
            Instant renewalDate,
            String milestoneLabel) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Cannot send renewal reminder email: recipient email is missing for subscription '{}'",
                    subscriptionName);
            return;
        }

        EmailMessage email = composer.compose(recipientEmail, subscriptionName, price, currency,
                renewalDate, milestoneLabel);
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.info("[MOCK EMAIL] To: {} | Subject: {}", email.recipientEmail(), email.subject());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(Objects.requireNonNull(email.recipientEmail()));
            helper.setSubject(Objects.requireNonNull(email.subject()));
            helper.setText(Objects.requireNonNull(email.htmlBody()), true);
            helper.setFrom(Objects.requireNonNull(fromEmail), Objects.requireNonNull(fromName));
            mailSender.send(message);
            log.info("Sent renewal reminder email to {} for subscription '{}' (milestone: {})",
                    recipientEmail, subscriptionName, milestoneLabel);
        } catch (Exception e) {
            log.warn("Failed to deliver SMTP email to {}: {}",
                    recipientEmail, e.getMessage());
            throw new EmailDeliveryException("SMTP failed to deliver the email", e);
        }
    }
}