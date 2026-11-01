package com.subtrack.backend.expenses;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findAllByUserIdOrderByBillingDateDesc(Long userId);

    List<Expense> findAllByUserIdAndBillingDateBetweenOrderByBillingDateDesc(
            Long userId,
            Instant start,
            Instant end);
}
