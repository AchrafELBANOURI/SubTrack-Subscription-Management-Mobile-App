package com.subtrack.backend.subscriptions;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findAllByUserIdOrderByRenewalDateAsc(Long userId);

    Optional<Subscription> findByIdAndUserId(Long id, Long userId);
}
