package com.subtrack.backend.notifications;

import com.subtrack.backend.subscriptions.Subscription;
import com.subtrack.backend.subscriptions.SubscriptionRepository;
import com.subtrack.backend.subscriptions.SubscriptionRequest;
import com.subtrack.backend.users.AppUser;
import com.subtrack.backend.users.AppUserRepository;
import com.subtrack.backend.users.ClerkUserService;
import com.subtrack.backend.users.UserClerkDetails;
import com.subtrack.backend.users.UserClerkDetails.UserClerkDetailsBuilder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RenewalReminderServiceTest {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private RenewalReminderLogRepository logRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private RenewalReminderService reminderService;

    @MockitoBean 
    private EmailService emailService;

    @MockitoBean
    private ClerkUserService clerkUserService;

    private AppUser user;

    @BeforeEach
    void setUp() {
        logRepository.deleteAll();
        subscriptionRepository.deleteAll();
        appUserRepository.deleteAll();

        user = appUserRepository.save(new AppUser("user_clerk_999", "subscriber@domain.com" , "user_clerk_first_name","user_clerk_last_name"));
    }

    @Test
    void sendsReminderWhenRenewalIs1DayAway() {
        Instant tomorrow = Instant.now().plus(Duration.ofHours(20));

        SubscriptionRequest request = new SubscriptionRequest(
                "Claude Pro",
                "Pro",
                "AI Tools",
                "Card",
                "active",
                new BigDecimal("20.00"),
                "USD",
                "Monthly",
                null,
                tomorrow,
                "#ea7a53"
        );
        Subscription sub = Subscription.from(user, request);
        sub.setRenewalDate(tomorrow);
        subscriptionRepository.save(sub);

        int sent = reminderService.checkAndSendReminders();

        assertEquals(1, sent);
        verify(emailService, times(1)).sendRenewalReminderEmail(
                eq("subscriber@domain.com"),
                eq("Claude Pro"),
                any(),
                eq("USD"),
                eq(tomorrow),
                eq("1 day")
        );

        // Running again should NOT send duplicate email
        int sentAgain = reminderService.checkAndSendReminders();
        assertEquals(0, sentAgain);
        verify(emailService, times(1)).sendRenewalReminderEmail(any(), any(), any(), any(), any(), any());
    }

    @Test
    void fetchesEmailFromClerkWhenAppUserEmailIsNull() {
        AppUser userWithoutEmail = appUserRepository.save(new AppUser("user_clerk_no_email", null,"user_clerk_first_name","user_clerk_last_name"));
        
        when(clerkUserService.fetchUserClerkDetails("user_clerk_no_email"))
            .thenReturn(UserClerkDetailsBuilder.builder().email("clerk_fetched@domain.com").firstName("user_clerk_first_name").lastName("user_clerk_last_name").build());

        Instant renewalIn7Days = Instant.now().plus(Duration.ofDays(7));

        SubscriptionRequest request = new SubscriptionRequest(
                "Canva Pro",
                "Team",
                "Design",
                "Card",
                "active",
                new BigDecimal("12.99"),
                "USD",
                "Monthly",
                null,
                renewalIn7Days,
                "#00c4cc"
        );
        Subscription sub = Subscription.from(userWithoutEmail, request);
        sub.setRenewalDate(renewalIn7Days);
        subscriptionRepository.save(sub);

        int sent = reminderService.checkAndSendReminders();

        assertEquals(1, sent);
        verify(emailService, times(1)).sendRenewalReminderEmail(
                eq("clerk_fetched@domain.com"),
                eq("Canva Pro"),
                any(),
                eq("USD"),
                eq(renewalIn7Days),
                eq("7 days")
        );
    }

    @Test
    void pausedSubscriptionDoesNotTriggerRenewalReminderEmail() {
        Instant tomorrow = Instant.now().plus(Duration.ofHours(20));

        SubscriptionRequest request = new SubscriptionRequest(
                "Paused Service",
                "Basic",
                "Other",
                "Card",
                "paused", // Paused!
                new BigDecimal("5.00"),
                "USD",
                "Monthly",
                null,
                tomorrow,
                "#000000"
        );
        Subscription sub = Subscription.from(user, request);
        sub.setRenewalDate(tomorrow);
        sub.updateStatus("paused");
        subscriptionRepository.save(sub);

        int sent = reminderService.checkAndSendReminders();

        assertEquals(0, sent);
        verify(emailService, never()).sendRenewalReminderEmail(anyString(), anyString(), any(), anyString(), any(), anyString());
    }
}
