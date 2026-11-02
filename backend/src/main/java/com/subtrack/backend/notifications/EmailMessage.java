package com.subtrack.backend.notifications;

public record EmailMessage(
        String recipientEmail,
        String subject,
        String htmlBody) {
}