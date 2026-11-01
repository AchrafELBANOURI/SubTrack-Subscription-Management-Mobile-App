package com.subtrack.backend.notifications;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RenewalReminderLogRepository extends JpaRepository<RenewalReminderLog, Long> {

    boolean existsBySubscriptionIdAndRenewalDateEpochMsAndMilestoneAndChannel(
            Long subscriptionId,
            Long renewalDateEpochMs,
            String milestone,
            String channel);
}
