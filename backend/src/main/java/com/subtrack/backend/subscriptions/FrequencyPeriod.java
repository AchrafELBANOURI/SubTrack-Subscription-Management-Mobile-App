package com.subtrack.backend.subscriptions;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record FrequencyPeriod(
        @NotNull @Positive Integer frequency,
        @NotBlank String period) {
}
