package com.subtrack.backend.expenses;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final RenewalService renewalService;

    public ExpenseController(ExpenseService expenseService, RenewalService renewalService) {
        this.expenseService = expenseService;
        this.renewalService = renewalService;
    }

    @GetMapping
    public List<ExpenseResponse> findAll(@AuthenticationPrincipal Jwt jwt) {
        return expenseService.findAll(jwt);
    }

    @GetMapping("/insights")
    public ExpenseInsightsResponse getInsights(@AuthenticationPrincipal Jwt jwt) {
        return expenseService.getInsights(jwt);
    }

    @PostMapping("/process-renewals")
    public ResponseEntity<Void> processRenewals() {
        renewalService.processAllDueRenewals();
        return ResponseEntity.noContent().build();
    }
}
