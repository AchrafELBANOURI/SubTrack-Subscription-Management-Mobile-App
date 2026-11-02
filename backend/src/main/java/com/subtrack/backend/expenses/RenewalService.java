package com.subtrack.backend.expenses;

import com.subtrack.backend.subscriptions.Subscription;
import com.subtrack.backend.subscriptions.SubscriptionRepository;
import com.subtrack.backend.users.AppUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class RenewalService {

    private static final Logger log = LoggerFactory.getLogger(RenewalService.class);

    private final SubscriptionRepository subscriptionRepository;
    private final ExpenseRepository expenseRepository;

    public RenewalService(
            SubscriptionRepository subscriptionRepository,
            ExpenseRepository expenseRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Automatic renewal background job. Runs every hour.
     * Only active subscriptions are renewed. Paused subscriptions are skipped.
     */
    @Scheduled(cron = "${subtrack.renewal.cron:0 0 * * * *}")
    @Transactional
    public void processAllDueRenewals() {
        Instant now = Instant.now();
        List<Subscription> dueSubscriptions = subscriptionRepository
                .findAllByStatusIgnoreCaseAndRenewalDateLessThanEqual("active", now);

        if (dueSubscriptions.isEmpty()) {
            return;
        }

        log.info("Processing automatic renewals for {} active subscriptions", dueSubscriptions.size());
        for (Subscription sub : dueSubscriptions) {
            processSingleSubscriptionRenewals(sub, now);
        }
    }

    /**
     * Process renewals on-demand for a given user.
     * Ensures expenses and renewal dates are up-to-date whenever the user queries their data.
     */
    @Transactional
    public void processRenewalsForUser(AppUser user) {
        if (user == null) {
            return;
        }
        Instant now = Instant.now();
        List<Subscription> userSubscriptions = subscriptionRepository
                .findAllByUserIdAndStatusIgnoreCase(user.getId(), "active");

        for (Subscription sub : userSubscriptions) {
            if (sub.getRenewalDate() != null && sub.getRenewalDate().isBefore(now)) {
                processSingleSubscriptionRenewals(sub, now);
            }
        }
    }

    private void processSingleSubscriptionRenewals(Subscription sub, Instant now) {
        // Double check status: if paused, do NOT renew and do NOT add expenses
        if (sub.getStatus() == null || !"active".equalsIgnoreCase(sub.getStatus())) {
            return;
        }

        Instant currentRenewal = sub.getRenewalDate();
        if (currentRenewal == null) {
            return;
        }

        int renewalsProcessed = 0;
        // Limit loop to at most 36 renewals to prevent infinite loops in edge test cases
        while (currentRenewal.isBefore(now) && renewalsProcessed < 36) {
            Expense expense = Expense.from(
                    sub.getUser(),
                    sub,
                    currentRenewal
            );
            
            expenseRepository.save(expense);

            currentRenewal = calculateNextRenewalDate(
                    currentRenewal,
                    sub.getFrequency(),
                    sub.getFrequencyPeriodFrequency(),
                    sub.getFrequencyPeriodPeriod()
            );
            renewalsProcessed++;
        }

        sub.setRenewalDate(currentRenewal);
        subscriptionRepository.save(sub);
        log.info("Subscription '{}' (id={}) automatically renewed {} time(s). Next renewal: {}",
                sub.getName(), sub.getId(), renewalsProcessed, currentRenewal);
    }

    public Instant calculateNextRenewalDate(
            Instant baseDate,
            String frequency,
            Integer customFreq,
            String customPeriod) {

        if (baseDate == null) {
            baseDate = Instant.now();
        }

        ZonedDateTime zdt = baseDate.atZone(ZoneOffset.UTC);

        if (customFreq != null && customFreq > 0 && customPeriod != null && !customPeriod.isBlank()) {
            String period = customPeriod.trim().toLowerCase();
            if (period.startsWith("day")) {
                return zdt.plusDays(customFreq).toInstant();
            } else if (period.startsWith("week")) {
                return zdt.plusWeeks(customFreq).toInstant();
            } else if (period.startsWith("month")) {
                return zdt.plusMonths(customFreq).toInstant();
            } else if (period.startsWith("year")) {
                return zdt.plusYears(customFreq).toInstant();
            }
        }

        if (frequency != null) {
            String freq = frequency.trim().toLowerCase();
            switch (freq) {
                case "daily":
                    return zdt.plusDays(1).toInstant();
                case "weekly":
                    return zdt.plusWeeks(1).toInstant();
                case "monthly":
                    return zdt.plusMonths(1).toInstant();
                case "yearly":
                    return zdt.plusYears(1).toInstant();
            }
        }

        return zdt.plusMonths(1).toInstant();
    }
}
