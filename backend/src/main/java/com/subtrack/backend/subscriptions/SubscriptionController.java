package com.subtrack.backend.subscriptions;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public List<SubscriptionResponse> findAll(@AuthenticationPrincipal Jwt jwt) {
        return subscriptionService.findAll(jwt);
    }

    @PostMapping
    public ResponseEntity<SubscriptionResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SubscriptionRequest request) {
        SubscriptionResponse response = subscriptionService.create(jwt, request);
        return ResponseEntity
                .created(URI.create("/api/subscriptions/" + response.id()))
                .body(response);
    }

    @PutMapping("/{subscriptionId}")
    public SubscriptionResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long subscriptionId,
            @Valid @RequestBody SubscriptionRequest request) {
        return subscriptionService.update(jwt, subscriptionId, request);
    }

    @DeleteMapping("/{subscriptionId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long subscriptionId) {
        subscriptionService.delete(jwt, subscriptionId);
        return ResponseEntity.noContent().build();
    }
}
