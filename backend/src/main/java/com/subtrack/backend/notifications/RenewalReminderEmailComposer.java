package com.subtrack.backend.notifications;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Component
public class RenewalReminderEmailComposer {

    public EmailMessage compose(
            String recipientEmail,
            String subscriptionName,
            BigDecimal price,
            String currency,
            Instant renewalDate,
            String milestoneLabel) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' HH:mm");
        String formattedDate = renewalDate.atZone(ZoneOffset.UTC).format(formatter);
        String subject = "Reminder: Your " + subscriptionName + " subscription will renew in " + milestoneLabel;
        String htmlBody = """
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
                        <div class="footer">Sent by SubTrack &bull; Manage all your recurring expenses in one place</div>
                    </div>
                </body>
                </html>
                """.formatted(subscriptionName, milestoneLabel, currency,
                price.setScale(2, RoundingMode.HALF_UP), formattedDate);

        return new EmailMessage(recipientEmail, subject, htmlBody);
    }
}