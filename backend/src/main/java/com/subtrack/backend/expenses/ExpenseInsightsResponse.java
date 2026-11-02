package com.subtrack.backend.expenses;

import java.math.BigDecimal;
import java.util.List;

public record ExpenseInsightsResponse(
        String month,
        BigDecimal totalExpenses,
        BigDecimal previousMonthExpenses,
        Double percentageChange,
        String currency,
        List<WeeklyDayExpense> weeklyUpcoming,
        List<ExpenseResponse> history) {
}
