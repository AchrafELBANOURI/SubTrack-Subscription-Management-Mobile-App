package com.subtrack.backend.notifications;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final RenewalReminderService renewalReminderService;

    public NotificationController(RenewalReminderService renewalReminderService) {
        this.renewalReminderService = renewalReminderService;
    }

    @PostMapping("/check-reminders")
    public ResponseEntity<Map<String, Object>> checkReminders() {
        int sent = renewalReminderService.checkAndSendReminders();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "remindersSent", sent
        ));
    }
}
