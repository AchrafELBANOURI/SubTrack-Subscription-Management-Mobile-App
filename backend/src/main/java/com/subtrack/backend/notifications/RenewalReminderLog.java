package com.subtrack.backend.notifications;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "renewal_reminder_logs",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"subscription_id", "renewal_date_epoch_ms", "milestone", "channel"})
        }
)
public class RenewalReminderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subscription_id", nullable = false)
    private Long subscriptionId;

    @Column(name = "renewal_date_epoch_ms", nullable = false)
    private Long renewalDateEpochMs;

    @Column(nullable = false, length = 32)
    private String milestone;

    @Column(nullable = false, length = 16)
    private String channel;

    @Column(nullable = false)
    private Instant sentAt;

    protected RenewalReminderLog() {
    }

    public RenewalReminderLog(Long subscriptionId, Instant renewalDate, String milestone, String channel) {
        this.subscriptionId = subscriptionId;
        this.renewalDateEpochMs = renewalDate != null ? renewalDate.toEpochMilli() : 0L;
        this.milestone = milestone;
        this.channel = channel;
    }

    @PrePersist
    void setSentAt() {
        if (sentAt == null) {
            sentAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public Long getRenewalDateEpochMs() {
        return renewalDateEpochMs;
    }

    public String getMilestone() {
        return milestone;
    }

    public String getChannel() {
        return channel;
    }

    public Instant getSentAt() {
        return sentAt;
    }
}
