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
        String frequency,
        FrequencyPeriod frequencyPeriod,
        Instant startDate,
        Instant renewalDate,
        String color,
        String icon) {

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
                subscription.getFrequency(),
                subscription.getFrequencyPeriodFrequency() == null
                        ? null
                        : new FrequencyPeriod(
                                subscription.getFrequencyPeriodFrequency(),
                                subscription.getFrequencyPeriodPeriod()),
                subscription.getStartDate(),
                subscription.getRenewalDate(),
                subscription.getColor(),
                subscription.getIcon());
    }
}
