package com.subtrack.backend.subscriptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;

public enum SubscriptionStatus {
    ACTIVE("active"),
    PAUSED("paused");

    private final String value;

    SubscriptionStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static SubscriptionStatus fromPath(String value) {
        return Arrays.stream(values())
                .filter(status -> status.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Status must be active or paused"));
    }
}
