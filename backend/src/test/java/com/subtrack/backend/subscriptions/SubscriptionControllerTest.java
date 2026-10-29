package com.subtrack.backend.subscriptions;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
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

    @Test
    void createsAndListsOnlyTheCurrentUsersSubscriptions() throws Exception {
        String request = """
                {
                    "name": "GitHub Pro",
                    "plan": "Developer",
                    "category": "Developer Tools",
                    "price": 9.99,
                    "currency": "USD",
                    "frequency": "Monthly",
                    "frequencyPeriod": {
                        "frequency": 1,
                        "period": "Months"
                    },
                    "status": "active",
                    "icon": 42
                }
                """;

        String response = mockMvc.perform(post("/api/subscriptions")
                        .with(jwt().jwt(jwt -> jwt.subject("user_subscriptions_123")))
                        .contentType("application/json")
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("GitHub Pro"))
                .andExpect(jsonPath("$.frequencyPeriod.frequency").value(1))
                .andExpect(jsonPath("$.frequencyPeriod.period").value("Months"))
                .andExpect(jsonPath("$.icon").value(42))
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
                    },
                    "icon": 7
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
                .replace("Notion", "Notion Plus")
                .replace("\"frequency\": \"Monthly\"", "\"frequency\": \"Yearly\"")
                .replace("\"period\": \"Months\"", "\"period\": \"Years\"")
                .replace("\"icon\": 7", "\"icon\": 8");

        mockMvc.perform(put("/api/subscriptions/{id}", subscriptionId)
                        .with(jwt().jwt(jwt -> jwt.subject("user_update_123")))
                        .contentType("application/json")
                        .content(updatedRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Notion Plus"))
                .andExpect(jsonPath("$.frequencyPeriod.frequency").value(1))
                .andExpect(jsonPath("$.frequencyPeriod.period").value("Years"))
                .andExpect(jsonPath("$.icon").value(8));

        mockMvc.perform(delete("/api/subscriptions/{id}", subscriptionId)
                        .with(jwt().jwt(jwt -> jwt.subject("user_update_123"))))
                .andExpect(status().isNoContent());
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
}
