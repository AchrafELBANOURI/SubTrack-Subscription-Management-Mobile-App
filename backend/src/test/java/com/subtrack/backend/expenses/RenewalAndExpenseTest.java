package com.subtrack.backend.expenses;

import com.subtrack.backend.subscriptions.FrequencyPeriod;
import com.subtrack.backend.subscriptions.Subscription;
import com.subtrack.backend.subscriptions.SubscriptionRepository;
import com.subtrack.backend.subscriptions.SubscriptionRequest;
import com.subtrack.backend.users.AppUser;
import com.subtrack.backend.users.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RenewalAndExpenseTest {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private RenewalService renewalService;

    private AppUser testUser;

    @BeforeEach
    void setUp() {
        expenseRepository.deleteAll();
        subscriptionRepository.deleteAll();
        appUserRepository.deleteAll();

        testUser = appUserRepository.save(new AppUser("user_test_123", "test@example.com"));
    }

    @Test
    void activeSubscriptionPastRenewalDateIsRenewedAndRecordedAsExpense() {
        Instant pastRenewal = Instant.now().minus(Duration.ofDays(2));

        SubscriptionRequest request = new SubscriptionRequest(
                "Netflix",
                "Standard",
                "Entertainment",
                "Credit Card",
                "active",
                new BigDecimal("15.99"),
                "USD",
                "Monthly",
                new FrequencyPeriod(1, "Months"),
                pastRenewal,
                "#E50914"
        );

        Subscription sub = Subscription.from(testUser, request);
        sub.setRenewalDate(pastRenewal);
        sub = subscriptionRepository.save(sub);

        // Run renewal processing for user
        renewalService.processRenewalsForUser(testUser);

        // Verify an expense was created for the renewal
        List<Expense> expenses = expenseRepository.findAllByUserIdOrderByBillingDateDesc(testUser.getId());
        assertEquals(1, expenses.size());
        assertEquals("Netflix", expenses.get(0).getSubscriptionName());
        assertEquals(0, new BigDecimal("15.99").compareTo(expenses.get(0).getAmount()));

        // Verify the subscription renewalDate was advanced to the future
        Subscription updatedSub = subscriptionRepository.findById(sub.getId()).orElseThrow();
        assertTrue(updatedSub.getRenewalDate().isAfter(Instant.now()));
    }

    @Test
    void pausedSubscriptionPastRenewalDateIsNotRenewedAndNoExpenseIsAdded() {
        Instant pastRenewal = Instant.now().minus(Duration.ofDays(5));

        SubscriptionRequest request = new SubscriptionRequest(
                "Spotify",
                "Premium",
                "Entertainment",
                "PayPal",
                "paused", // Paused status!
                new BigDecimal("9.99"),
                "USD",
                "Monthly",
                new FrequencyPeriod(1, "Months"),
                pastRenewal,
                "#1DB954"
        );

        Subscription sub = Subscription.from(testUser, request);
        sub.setRenewalDate(pastRenewal);
        sub.updateStatus("paused");
        sub = subscriptionRepository.save(sub);

        // Run renewal processing for user
        renewalService.processRenewalsForUser(testUser);

        // Verify NO expense was created
        List<Expense> expenses = expenseRepository.findAllByUserIdOrderByBillingDateDesc(testUser.getId());
        assertTrue(expenses.isEmpty(), "Paused subscription must NOT generate an expense on renewal date");

        // Verify renewalDate was NOT changed
        Subscription unchangedSub = subscriptionRepository.findById(sub.getId()).orElseThrow();
        assertEquals(pastRenewal, unchangedSub.getRenewalDate());
    }

    @Test
    void futureSubscriptionIsNotPrematurelyRenewed() {
        Instant futureRenewal = Instant.now().plus(Duration.ofDays(10));

        SubscriptionRequest request = new SubscriptionRequest(
                "GitHub",
                "Pro",
                "Developer Tools",
                "Credit Card",
                "active",
                new BigDecimal("4.00"),
                "USD",
                "Monthly",
                null,
                futureRenewal,
                "#24292e"
        );

        Subscription sub = Subscription.from(testUser, request);
        sub.setRenewalDate(futureRenewal);
        subscriptionRepository.save(sub);

        renewalService.processRenewalsForUser(testUser);

        List<Expense> expenses = expenseRepository.findAllByUserIdOrderByBillingDateDesc(testUser.getId());
        assertTrue(expenses.isEmpty());
    }
}
