package com.subtrack.backend.notifications;

import java.math.BigDecimal;
import java.time.Instant;

public interface EmailService {
    void sendRenewalReminderEmail(
            String recipientEmail,
            String subscriptionName,
            BigDecimal price,
            String currency,
            Instant renewalDate,
            String milestoneLabel);
}