package com.subtrack.backend.users;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.subtrack.backend.users.UserClerkDetails.UserClerkDetailsBuilder;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClerkUserService clerkUserService;

    @BeforeEach
    void configureClerkMock() {
        when(clerkUserService.fetchUserClerkDetails("user_test_123"))
                .thenReturn(
                        UserClerkDetailsBuilder.builder()
                                .email("test@example.com")
                                .build()
                );
    }

    @Test
    void createsCurrentUserFromClerkClaims() throws Exception {
        mockMvc.perform(get("/api/me").with(jwt().jwt(jwt -> jwt
                        .subject("user_test_123")
                        .claim("email", "user@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clerkUserId").value("user_test_123"))
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    void reusesExistingUserForTheSameClerkId() throws Exception {
        mockMvc.perform(get("/api/me").with(jwt().jwt(jwt -> jwt
                        .subject("user_same_123")
                        .claim("email", "first@example.com"))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/me").with(jwt().jwt(jwt -> jwt
                        .subject("user_same_123")
                        .claim("email", "updated@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clerkUserId").value("user_same_123"))
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }
}
