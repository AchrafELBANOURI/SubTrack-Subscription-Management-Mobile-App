package com.subtrack.backend.expenses;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

record ExpenseRequest(
                @NotNull Long subscriptionId,
                @NotNull BigDecimal amount,
                @NotBlank String currency,
                @NotBlank String category,
                @NotBlank String frequency,
                @NotBlank String icon,
                @NotBlank String color,
                @NotNull Instant billingDate) {
}
