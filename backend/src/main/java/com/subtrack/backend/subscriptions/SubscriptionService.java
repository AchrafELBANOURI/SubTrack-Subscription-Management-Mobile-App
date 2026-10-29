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
    private final LogoDevService logoDevService;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService,
        LogoDevService logoDevService) {
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
        this.logoDevService = logoDevService;
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
        
        Subscription subscription = new Subscription(user, request);

        subscription.setIcon(domain);
        
        return SubscriptionResponse.from(
                subscriptionRepository.save(subscription));
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
        subscriptionRepository.delete(findOwnedSubscription(subscriptionId, user.getId()));
    }

    private Subscription findOwnedSubscription(Long subscriptionId, Long userId) {
        return subscriptionRepository.findByIdAndUserId(subscriptionId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND, "Subscription not found"));
    }
}
