package com.subtrack.backend.subscriptions;

import com.subtrack.backend.users.AppUser;
import com.subtrack.backend.users.CurrentUserService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService) {
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
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
        return SubscriptionResponse.from(
                subscriptionRepository.save(new Subscription(user, request)));
    }

    @Transactional
    public SubscriptionResponse update(
            Jwt jwt,
            Long subscriptionId,
            SubscriptionRequest request) {
        AppUser user = currentUserService.findOrCreate(jwt);
        Subscription subscription = findOwnedSubscription(subscriptionId, user.getId());
        subscription.updateFrom(request);
        return SubscriptionResponse.from(subscription);
    }

    @Transactional
    public void delete(Jwt jwt, Long subscriptionId) {
        AppUser user = currentUserService.findOrCreate(jwt);
        subscriptionRepository.delete(findOwnedSubscription(subscriptionId, user.getId()));
    }

    private Subscription findOwnedSubscription(Long subscriptionId, Long userId) {
        return subscriptionRepository.findByIdAndUserId(subscriptionId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND, "Subscription not found"));
    }
}
