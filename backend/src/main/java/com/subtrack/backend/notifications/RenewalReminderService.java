package com.subtrack.backend.notifications;

import com.subtrack.backend.subscriptions.Subscription;
import com.subtrack.backend.subscriptions.SubscriptionRepository;
import com.subtrack.backend.users.AppUser;
import com.subtrack.backend.users.AppUserRepository;
import com.subtrack.backend.users.ClerkUserService;
import com.subtrack.backend.users.UserClerkDetails;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class RenewalReminderService {

    private static final Logger log = LoggerFactory.getLogger(RenewalReminderService.class);

    private final SubscriptionRepository subscriptionRepository;
    private final RenewalReminderLogRepository reminderLogRepository;
    private final EmailService emailService;
    private final ClerkUserService clerkUserService;
    private final AppUserRepository appUserRepository;

    public RenewalReminderService(
            SubscriptionRepository subscriptionRepository,
            RenewalReminderLogRepository reminderLogRepository,
            EmailService emailService,
            ClerkUserService clerkUserService,
            AppUserRepository appUserRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.reminderLogRepository = reminderLogRepository;
        this.emailService = emailService;
        this.clerkUserService = clerkUserService;
        this.appUserRepository = appUserRepository;
    }

    /**
     * Runs daily at 9:00 AM UTC to inspect active subscriptions and deliver
     * renewal warning emails for upcoming renewal milestones (1d, 7d, 14d, 1mo, 2mo).
     */
    @Scheduled(cron = "${subtrack.reminders.cron:0 0 9 * * *}")
    @Transactional
    public void runScheduledReminders() {
        checkAndSendReminders();
    }

    @Transactional
    public int checkAndSendReminders() {
        Instant now = Instant.now();
        Instant maxWindow = now.plus(Duration.ofDays(65));

        List<Subscription> upcomingSubscriptions = subscriptionRepository
                .findAllByStatusIgnoreCaseAndRenewalDateBetween("active", now, maxWindow);

        int remindersSent = 0;
        LocalDate todayUtc = now.atZone(ZoneOffset.UTC).toLocalDate();

        for (Subscription sub : upcomingSubscriptions) {
            Instant renewalDate = sub.getRenewalDate();
            if (renewalDate == null) {
                continue;
            }

            LocalDate renewalDayUtc = renewalDate.atZone(ZoneOffset.UTC).toLocalDate();
            long daysRemaining = ChronoUnit.DAYS.between(todayUtc, renewalDayUtc);

            // Match required milestones: 1 day, 7 days, 14 days, 1 month (30d), 2 months (60d)
            String milestone = null;
            String milestoneLabel = null;

            if (daysRemaining <= 1) {
                milestone = "1_DAY";
                milestoneLabel = "1 day";
            } else if (daysRemaining == 7) {
                milestone = "7_DAYS";
                milestoneLabel = "7 days";
            } else if (daysRemaining == 14) {
                milestone = "14_DAYS";
                milestoneLabel = "14 days";
            } else if (daysRemaining == 30) {
                milestone = "1_MONTH";
                milestoneLabel = "1 month";
            } else if (daysRemaining == 60) {
                milestone = "2_MONTHS";
                milestoneLabel = "2 months";
            }

            if (milestone == null) {
                continue;
            }

            long renewalEpochMs = renewalDate.toEpochMilli();
            boolean alreadySent = reminderLogRepository
                    .existsBySubscriptionIdAndRenewalDateEpochMsAndMilestoneAndChannel(
                            sub.getId(), renewalEpochMs, milestone, "EMAIL");

            if (alreadySent) {
                continue;
            }

            AppUser user = sub.getUser();
            String email = user.getEmail();

            // If user's email was null or empty, fetch it directly from Clerk using Clerk API
            if (email == null || email.isBlank()) {
                UserClerkDetails fetched = clerkUserService.fetchUserClerkDetails(user.getClerkUserId());
                if (fetched != null && !fetched.email().isBlank()) {
                    user.updateUserDetails(fetched);
                    appUserRepository.save(user);
                    email = fetched.email();
                }
            }

            if (email != null && !email.isBlank()) {
                emailService.sendRenewalReminderEmail(
                        email,
                        sub.getName(),
                        sub.getPrice(),
                        sub.getCurrency(),
                        renewalDate,
                        milestoneLabel
                );

                reminderLogRepository.save(new RenewalReminderLog(
                        sub.getId(),
                        renewalDate,
                        milestone,
                        "EMAIL"
                ));
                remindersSent++;
            }
        }

        log.info("Renewal reminder check completed: {} emails sent", remindersSent);
        return remindersSent;
    }
}