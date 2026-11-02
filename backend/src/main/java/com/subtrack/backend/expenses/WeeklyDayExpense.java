package com.subtrack.backend.expenses;

import java.math.BigDecimal;

public record WeeklyDayExpense(
    String day,
    String date,
    BigDecimal amount,
    boolean isPeak
) {
}
