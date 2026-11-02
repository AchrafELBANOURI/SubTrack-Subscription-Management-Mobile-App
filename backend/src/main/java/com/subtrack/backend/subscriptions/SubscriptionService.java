package com.subtrack.backend.subscriptions;

import com.subtrack.backend.expenses.Expense;
import com.subtrack.backend.expenses.ExpenseRepository;
import com.subtrack.backend.users.AppUser;
import com.subtrack.backend.users.CurrentUserService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;
    private final LogoDevService logoDevService;

    private final ExpenseRepository expenseRepository;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService,
            LogoDevService logoDevService,
            ExpenseRepository expenseRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
        this.logoDevService = logoDevService;
        this.expenseRepository = expenseRepository;
    }

    @Transactional
    public List<SubscriptionResponse> findAll(Jwt jwt) {
        AppUser user = currentUserService.findOrCreate(jwt);
        return subscriptionRepository.findAllByUserIdOrderByRenewalDateAsc(user.getId())
                .stream()
                .map(SubscriptionResponse::from)
                .toList();
    }

    @Transactional
    public SubscriptionResponse create(Jwt jwt, SubscriptionRequest request) {
        AppUser user = currentUserService.findOrCreate(jwt);
        
        String domain = logoDevService.findDomainByName(request.name());
        
        Subscription subscription = Subscription.from(user, request);
        subscription.setIcon(domain);
        
        Subscription saved = subscriptionRepository.save(subscription);

        // When a new subscription is active, record its initial expense
        if (saved.getStatus() == null || "active".equalsIgnoreCase(saved.getStatus())) {
            Instant billingDate = saved.getStartDate() != null ? saved.getStartDate() : Instant.now();
            expenseRepository.save(Expense.from(user, saved, billingDate));
        }

        return SubscriptionResponse.from(saved);
    }

    @Transactional
    public SubscriptionResponse update(
            Jwt jwt,
            Long subscriptionId,
            SubscriptionRequest request
        ){
        AppUser user = currentUserService.findOrCreate(jwt);
        Subscription subscription = findOwnedSubscription(subscriptionId, user.getId());

        String domain = logoDevService.findDomainByName(request.name());

        subscription.updateFrom(request);
        
        subscription.setIcon(domain);
        
        return SubscriptionResponse.from(subscription);
    }

    @Transactional
    public void updateStatus(Jwt jwt, Long subscriptionId, SubscriptionStatus status) {
        AppUser user = currentUserService.findOrCreate(jwt);
        Subscription subscription = findOwnedSubscription(subscriptionId, user.getId());
        subscription.updateStatus(status.value());
    }

    @Transactional
    public void delete(Jwt jwt, Long subscriptionId) {
        AppUser user = currentUserService.findOrCreate(jwt);
        Subscription subscription = findOwnedSubscription(subscriptionId, user.getId());
        expenseRepository.detachFromSubscription(subscription.getId());
        subscriptionRepository.delete(subscription);
    }

    private Subscription findOwnedSubscription(Long subscriptionId, Long userId) {
        return subscriptionRepository.findByIdAndUserId(subscriptionId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND, "Subscription not found"));
    }
}
