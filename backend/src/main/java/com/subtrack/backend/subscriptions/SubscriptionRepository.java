package com.subtrack.backend.subscriptions;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findAllByUserIdOrderByRenewalDateAsc(Long userId);

    Optional<Subscription> findByIdAndUserId(Long id, Long userId);

    List<Subscription> findAllByStatusIgnoreCaseAndRenewalDateLessThanEqual(String status, Instant date);

    List<Subscription> findAllByUserIdAndStatusIgnoreCase(Long userId, String status);

    List<Subscription> findAllByStatusIgnoreCaseAndRenewalDateBetween(String status, Instant start, Instant end);
}

