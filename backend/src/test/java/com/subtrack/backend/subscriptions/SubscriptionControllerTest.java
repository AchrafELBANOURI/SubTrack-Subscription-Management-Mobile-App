package com.subtrack.backend.subscriptions;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.subtrack.backend.users.ClerkUserService;
import com.subtrack.backend.users.UserClerkDetails.UserClerkDetailsBuilder;
import com.subtrack.backend.expenses.Expense;
import com.subtrack.backend.expenses.ExpenseRepository;

import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SubscriptionControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private LogoDevService logoDevService;

        @MockitoBean
        private ClerkUserService clerkUserService;

        @Autowired
        private ExpenseRepository expenseRepository;

        @BeforeEach
        void configureClerkMock() {
                when(clerkUserService.fetchUserClerkDetails(anyString()))
                        .thenReturn(
                                UserClerkDetailsBuilder.builder()
                                        .email("test@example.com")
                                        .build()
                        );
        }

        @BeforeEach
        void configureLogoDevMock() {
                when(logoDevService.findDomainByName("GitHub")).thenReturn("github.com");
                when(logoDevService.findDomainByName("Github")).thenReturn("github.com");
                when(logoDevService.findDomainByName("Notion")).thenReturn("notion.so");
                when(logoDevService.findDomainByName("Spotify")).thenReturn("spotify.com");
        }

        @Test
        void createsAndListsOnlyTheCurrentUsersSubscriptions() throws Exception {
                String request = """
                        {
                        "name": "GitHub",
                        "plan": "Developer",
                        "category": "Developer Tools",
                        "price": 9.99,
                        "currency": "USD",
                        "frequency": "Monthly",
                        "frequencyPeriod": {
                                "frequency": 1,
                                "period": "Months"
                        },
                        "status": "active"
                        }
                        """;

                String response = mockMvc.perform(post("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_subscriptions_123")))
                                .contentType("application/json")
                                .content(request))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.name").value("GitHub"))
                        .andExpect(jsonPath("$.frequencyPeriod.frequency").value(1))
                        .andExpect(jsonPath("$.frequencyPeriod.period").value("Months"))
                        .andExpect(jsonPath("$.icon").value("github.com"))
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                long subscriptionId = com.jayway.jsonpath.JsonPath
                        .parse(response)
                        .read("$.id", Long.class);

                mockMvc.perform(get("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_subscriptions_123"))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$", hasSize(1)))
                        .andExpect(jsonPath("$[0].id").value(subscriptionId));

                mockMvc.perform(get("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("another_user_123"))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void updatesAndDeletesAnOwnedSubscription() throws Exception {
                String request = """
                        {
                        "name": "Notion",
                        "price": 12.00,
                        "currency": "USD",
                        "frequency": "Monthly",
                        "frequencyPeriod": {
                                "frequency": 1,
                                "period": "Months"
                        }
                        }
                        """;

                String response = mockMvc.perform(post("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_update_123")))
                                .contentType("application/json")
                                .content(request))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                long subscriptionId = com.jayway.jsonpath.JsonPath
                        .parse(response)
                        .read("$.id", Long.class);

                String updatedRequest = request
                        .replace("Notion", "Github")
                        .replace("\"frequency\": \"Monthly\"", "\"frequency\": \"Yearly\"")
                        .replace("\"period\": \"Months\"", "\"period\": \"Years\"");

                mockMvc.perform(put("/api/subscriptions/{id}", subscriptionId)
                                .with(jwt().jwt(jwt -> jwt.subject("user_update_123")))
                                .contentType("application/json")
                                .content(updatedRequest))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.name").value("Github"))
                        .andExpect(jsonPath("$.frequencyPeriod.frequency").value(1))
                        .andExpect(jsonPath("$.frequencyPeriod.period").value("Years"))
                        .andExpect(jsonPath("$.icon").value("github.com"));

                mockMvc.perform(delete("/api/subscriptions/{id}", subscriptionId)
                                .with(jwt().jwt(jwt -> jwt.subject("user_update_123"))))
                        .andExpect(status().isNoContent());
        }

        @Test
        void recalculatesRenewalDateWhenUpdatingFrequencyPeriod() throws Exception {
                String createRequest = """
                        {
                        "name": "Notion",
                        "price": 12.00,
                        "currency": "USD",
                        "frequency": "Monthly",
                        "frequencyPeriod": {
                                "frequency": 1,
                                "period": "Months"
                        },
                        "renewalDate": "2030-01-01T00:00:00Z"
                        }
                        """;

                String response = mockMvc.perform(post("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_frequency_period_123")))
                                .contentType("application/json")
                                .content(createRequest))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                long subscriptionId = com.jayway.jsonpath.JsonPath
                        .parse(response)
                        .read("$.id", Long.class);

                String updateRequest = createRequest
                        .replace("\"frequency\": 1", "\"frequency\": 2")
                        .replace("\"renewalDate\": \"2030-01-01T00:00:00Z\"",
                                "\"renewalDate\": \"2030-03-01T00:00:00Z\"");

                Instant updateStarted = Instant.now();
                String updatedResponse = mockMvc.perform(put("/api/subscriptions/{id}", subscriptionId)
                                .with(jwt().jwt(jwt -> jwt.subject("user_frequency_period_123")))
                                .contentType("application/json")
                                .content(updateRequest))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.frequency").value("Monthly"))
                        .andExpect(jsonPath("$.frequencyPeriod.frequency").value(2))
                        .andExpect(jsonPath("$.frequencyPeriod.period").value("Months"))
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                Instant updateFinished = Instant.now();
                String renewalDateValue = com.jayway.jsonpath.JsonPath
                        .parse(updatedResponse)
                        .read("$.renewalDate", String.class);
                Instant renewalDate = Instant.parse(renewalDateValue);

                Instant earliestExpectedDate = updateStarted
                        .atZone(ZoneOffset.UTC)
                        .plusMonths(2)
                        .minusSeconds(1)
                        .toInstant();
                Instant latestExpectedDate = updateFinished
                        .atZone(ZoneOffset.UTC)
                        .plusMonths(2)
                        .plusSeconds(1)
                        .toInstant();

                assertThat(renewalDate).isBetween(earliestExpectedDate, latestExpectedDate);
                assertThat(renewalDate).isNotEqualTo(Instant.parse("2030-03-01T00:00:00Z"));
        }

        @Test
        void deletingSubscriptionKeepsHistoricalExpenses() throws Exception {
                String request = """
                        {
                        "name": "Netflix",
                        "price": 15.99,
                        "currency": "USD",
                        "frequency": "Monthly"
                        }
                        """;

                String response = mockMvc.perform(post("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_delete_history_123")))
                                .contentType("application/json")
                                .content(request))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                long subscriptionId = com.jayway.jsonpath.JsonPath
                        .parse(response)
                        .read("$.id", Long.class);

                Expense historicalExpense = expenseRepository.findAll().stream()
                        .filter(expense -> expense.getSubscription() != null
                                && expense.getSubscription().getId().equals(subscriptionId))
                        .findFirst()
                        .orElseThrow();

                mockMvc.perform(delete("/api/subscriptions/{id}", subscriptionId)
                                .with(jwt().jwt(jwt -> jwt.subject("user_delete_history_123"))))
                        .andExpect(status().isNoContent());

                Expense preservedExpense = expenseRepository.findById(historicalExpense.getId())
                        .orElseThrow();
                assertThat(preservedExpense.getAmount()).isEqualByComparingTo("15.99");
                assertThat(preservedExpense.getSubscriptionName()).isEqualTo("Netflix");
                assertThat(preservedExpense.getSubscription()).isNull();
        }

        @Test
        void updatesSubscriptionStatusWithAllowedValues() throws Exception {
                String request = """
                        {
                        "name": "Spotify",
                        "price": 10.00,
                        "currency": "USD",
                        "frequency": "Monthly"
                        }
                        """;

                String response = mockMvc.perform(post("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_status_123")))
                                .contentType("application/json")
                                .content(request))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                long subscriptionId = com.jayway.jsonpath.JsonPath
                        .parse(response)
                        .read("$.id", Long.class);

                mockMvc.perform(patch("/api/subscriptions/{id}/status/paused", subscriptionId)
                                .with(jwt().jwt(jwt -> jwt.subject("user_status_123"))))
                        .andExpect(status().isNoContent());

                mockMvc.perform(get("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_status_123"))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].status").value("paused"));

                mockMvc.perform(patch("/api/subscriptions/{id}/status/cancelled", subscriptionId)
                                .with(jwt().jwt(jwt -> jwt.subject("user_status_123"))))
                        .andExpect(status().isBadRequest());
        }

        @Test
        void persistsGeneratedIconWhenCreatingSubscription() throws Exception {
                String request = """
                        {
                                "name": "GitHub",
                                "price": 9.99,
                                "currency": "USD",
                                "frequency": "Monthly"
                        }
                        """;

                String response = mockMvc.perform(post("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_icon_create")))
                                .contentType("application/json")
                                .content(request))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.icon").value("github.com"))
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                long subscriptionId = com.jayway.jsonpath.JsonPath
                        .parse(response)
                        .read("$.id", Long.class);

                mockMvc.perform(get("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_icon_create"))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].id").value(subscriptionId))
                        .andExpect(jsonPath("$[0].icon").value("github.com"));

                verify(logoDevService).findDomainByName("GitHub");
        }

        @Test
        void updatesGeneratedIconWhenSubscriptionNameChanges() throws Exception {
                String createRequest = """
                        {
                                "name": "Notion",
                                "price": 12.00,
                                "currency": "USD",
                                "frequency": "Monthly"
                        }
                        """;

                String response = mockMvc.perform(post("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_icon_update")))
                                .contentType("application/json")
                                .content(createRequest))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.icon").value("notion.so"))
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                long subscriptionId = com.jayway.jsonpath.JsonPath
                        .parse(response)
                        .read("$.id", Long.class);

                String updateRequest = """
                        {
                                "name": "Github",
                                "price": 12.00,
                                "currency": "USD",
                                "frequency": "Monthly"
                        }
                        """;

                mockMvc.perform(put("/api/subscriptions/{id}", subscriptionId)
                                .with(jwt().jwt(jwt -> jwt.subject("user_icon_update")))
                                .contentType("application/json")
                                .content(updateRequest))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.icon").value("github.com"));

                mockMvc.perform(get("/api/subscriptions")
                                .with(jwt().jwt(jwt -> jwt.subject("user_icon_update"))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].icon").value("github.com"));

                verify(logoDevService).findDomainByName("Notion");
                verify(logoDevService).findDomainByName("Github");
        }
}
