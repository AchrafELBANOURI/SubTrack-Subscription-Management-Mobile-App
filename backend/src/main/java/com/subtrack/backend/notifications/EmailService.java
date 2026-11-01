package com.subtrack.backend.notifications;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

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

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' HH:mm");
        String formattedDate = renewalDate.atZone(ZoneOffset.UTC).format(formatter);
        String subject = "Reminder: Your " + subscriptionName + " subscription will renew in " + milestoneLabel;

        String htmlBody = buildHtmlEmail(subscriptionName, price.setScale(2, RoundingMode.HALF_UP), currency,
                formattedDate, milestoneLabel);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.info("[MOCK EMAIL] To: {} | Subject: {} | Milestone: {} | Amount: {} {}",
                    recipientEmail, subject, milestoneLabel, currency, price);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom("swe.achraf@gmail.com", "SubTrack");

            mailSender.send(message);
            log.info("Sent renewal reminder email to {} for subscription '{}' (milestone: {})",
                    recipientEmail, subscriptionName, milestoneLabel);
        } catch (Exception e) {
            log.warn("Failed to deliver email to {}: {}. (Email logged for notification history)",
                    recipientEmail, e.getMessage());
        }
    }

    private String buildHtmlEmail(
            String subscriptionName,
            BigDecimal price,
            String currency,
            String formattedDate,
            String milestoneLabel) {

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Subscription Renewal Notice</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fff9e3; color: #081126; margin: 0; padding: 24px; }
                        .card { background-color: #ffffff; max-width: 540px; margin: 0 auto; border-radius: 20px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); }
                        .logo { font-size: 24px; font-weight: 800; color: #ea7a53; margin-bottom: 20px; }
                        h2 { font-size: 20px; margin-top: 0; color: #081126; }
                        .alert-box { background-color: #f6eecf; border-left: 4px solid #ea7a53; padding: 16px; border-radius: 8px; margin: 20px 0; }
                        .price-tag { font-size: 28px; font-weight: 700; color: #081126; margin: 10px 0; }
                        .footer { margin-top: 24px; font-size: 13px; color: rgba(0,0,0,0.5); text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="logo">SubTrack</div>
                        <h2>Upcoming Subscription Renewal</h2>
                        <p>Hi,</p>
                        <p>This is a friendly reminder that your subscription for <strong>%s</strong> is scheduled to automatically renew in <strong>%s</strong>.</p>
                        
                        <div class="alert-box">
                            <div>Amount to be charged:</div>
                            <div class="price-tag">%s %s</div>
                            <div>Renewal Date: <strong>%s</strong></div>
                        </div>

                        <p>If you wish to keep this subscription, no action is needed &mdash; it will renew automatically.</p>
                        <p>If you prefer not to renew, please open <strong>SubTrack</strong> on your mobile device and choose <strong>Pause</strong> or <strong>Cancel</strong> before the renewal date.</p>
                        
                        <div class="footer">
                            Sent by SubTrack &bull; Manage all your recurring expenses in one place
                        </div>
                        </div>
                </body>
                </html>
                """.formatted(subscriptionName, milestoneLabel, currency, price, formattedDate);
    }
}
