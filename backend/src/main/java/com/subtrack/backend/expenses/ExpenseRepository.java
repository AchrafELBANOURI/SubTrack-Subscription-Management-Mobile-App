package com.subtrack.backend.expenses;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Modifying(clearAutomatically = true)
    @Query("update Expense e set e.subscription = null where e.subscription.id = :subscriptionId")
    void detachFromSubscription(@Param("subscriptionId") Long subscriptionId);

    @Modifying(clearAutomatically = true)
    @Query("delete from Expense e where e.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    List<Expense> findAllByUserIdOrderByBillingDateDesc(Long userId);

    List<Expense> findAllByUserIdAndBillingDateBetweenOrderByBillingDateDesc(
            Long userId,
            Instant start,
            Instant end);
}
