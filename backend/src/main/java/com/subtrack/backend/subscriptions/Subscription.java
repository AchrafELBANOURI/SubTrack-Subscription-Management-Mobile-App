package com.subtrack.backend.subscriptions;

import com.subtrack.backend.users.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private String name;

    private String plan;
    private String category;
    private String paymentMethod;
    private String status;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private String billing;

    private Instant startDate;
    private Instant renewalDate;
    private String color;

    protected Subscription() {
    }

    public Subscription(AppUser user, SubscriptionRequest request) {
        this.user = user;
        updateFrom(request);
    }

    public void updateFrom(SubscriptionRequest request) {
        name = request.name();
        plan = request.plan();
        category = request.category();
        paymentMethod = request.paymentMethod();
        status = request.status();
        price = request.price();
        currency = request.currency();
        billing = request.billing();
        startDate = request.startDate();
        renewalDate = request.renewalDate();
        color = request.color();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPlan() {
        return plan;
    }

    public String getCategory() {
        return category;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }

    public String getBilling() {
        return billing;
    }

    public Instant getStartDate() {
        return startDate;
    }

    public Instant getRenewalDate() {
        return renewalDate;
    }

    public String getColor() {
        return color;
    }
}
