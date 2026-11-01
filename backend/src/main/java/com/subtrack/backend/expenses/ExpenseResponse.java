package com.subtrack.backend.expenses;

import java.math.BigDecimal;
import java.time.Instant;

public record ExpenseResponse(
        Long id,
        Long subscriptionId,
        String name,
        BigDecimal amount,
        String currency,
        String category,
        String frequency,
        String icon,
        String color,
        Instant billingDate) {

    public static ExpenseResponse from(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getSubscription() != null ? expense.getSubscription().getId() : null,
                expense.getSubscriptionName(),
                expense.getAmount(),
                expense.getCurrency(),
                expense.getCategory(),
                expense.getFrequency(),
                expense.getIcon(),
                expense.getColor(),
                expense.getBillingDate());
    }
}
