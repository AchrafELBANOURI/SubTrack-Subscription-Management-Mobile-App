package com.subtrack.backend.expenses;

import com.subtrack.backend.subscriptions.Subscription;
import com.subtrack.backend.users.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @Column(nullable = false)
    private String subscriptionName;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    private String category;
    private String frequency;
    private String icon;
    private String color;

    @Column(nullable = false)
    private Instant billingDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Expense() {
    }

    public static Expense from(AppUser user, Subscription subscription, Instant billingDate) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setSubscription(subscription);
        expense.setSubscriptionName(subscription.getName());
        expense.setAmount(subscription.getPrice());
        expense.setCurrency(subscription.getCurrency());
        expense.setCategory(subscription.getCategory());
        expense.setFrequency(subscription.getFrequency());
        expense.setIcon(subscription.getIcon());
        expense.setColor(subscription.getColor());
        expense.setBillingDate(billingDate);
        return expense;
    }

    @PrePersist
    void setCreatedAt() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (billingDate == null) {
            billingDate = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public Subscription getSubscription() {
        return subscription;
    }

    public String getSubscriptionName() {
        return subscriptionName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getCategory() {
        return category;
    }

    public String getFrequency() {
        return frequency;
    }

    public String getIcon() {
        return icon;
    }

    public String getColor() {
        return color;
    }

    public Instant getBillingDate() {
        return billingDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    private void setUser(AppUser user) {
        this.user = user;
    }

    private void setSubscription(Subscription subscription) {
        this.subscription = subscription;
    }

    private void setSubscriptionName(String subscriptionName) {
        this.subscriptionName = subscriptionName;
    }

    private void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    private void setCurrency(String currency) {
        this.currency = currency;
    }

    private void setCategory(String category) {
        this.category = category;
    }

    private void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    private void setIcon(String icon) {
        this.icon = icon;
    }

    private void setColor(String color) {
        this.color = color;
    }

    private void setBillingDate(Instant billingDate) {
        this.billingDate = billingDate;
    }
}

