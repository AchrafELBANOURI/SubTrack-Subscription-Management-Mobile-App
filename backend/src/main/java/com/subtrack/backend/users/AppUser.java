package com.subtrack.backend.users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clerk_user_id", nullable = false, unique = true, updatable = false)
    private String clerkUserId;

    @Column
    private String email;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected AppUser() {
    }

    public AppUser(String clerkUserId, String email) {
        this.clerkUserId = clerkUserId;
        this.email = email;
    }

    @PrePersist
    void setCreatedAt() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getClerkUserId() {
        return clerkUserId;
    }

    public String getEmail() {
        return email;
    }

    public void updateEmail(String email) {
        this.email = email;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
