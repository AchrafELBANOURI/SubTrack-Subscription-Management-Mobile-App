package com.subtrack.backend.subscriptions;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.time.Instant;

public record SubscriptionRequest(
        @NotBlank String name,
        String plan,
        String category,
        String paymentMethod,
        String status,
        @NotNull @Positive BigDecimal price,
        @NotBlank String currency,
        @NotBlank String frequency,
        @Valid FrequencyPeriod frequencyPeriod,
        Instant renewalDate,
        String color,
        Integer icon) {
}
