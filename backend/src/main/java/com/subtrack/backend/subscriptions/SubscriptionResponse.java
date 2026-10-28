package com.subtrack.backend.subscriptions;

import java.math.BigDecimal;
import java.time.Instant;

public record SubscriptionResponse(
        Long id,
        String name,
        String plan,
        String category,
        String paymentMethod,
        String status,
        BigDecimal price,
        String currency,
        String billing,
        Instant startDate,
        Instant renewalDate,
        String color) {

    public static SubscriptionResponse from(Subscription subscription) {
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getName(),
                subscription.getPlan(),
                subscription.getCategory(),
                subscription.getPaymentMethod(),
                subscription.getStatus(),
                subscription.getPrice(),
                subscription.getCurrency(),
                subscription.getBilling(),
                subscription.getStartDate(),
                subscription.getRenewalDate(),
                subscription.getColor());
    }
}
