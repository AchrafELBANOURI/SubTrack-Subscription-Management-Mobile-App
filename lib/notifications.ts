import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { router } from "expo-router";
import { pauseSubscription } from "./backendApi";
import { showErrorToast, showSuccessToast } from "./toast";
import { colors } from "../constants/theme";

const RENEWAL_CATEGORY_ID = "RENEWAL_REMINDER";
const RENEWAL_CHANNEL_ID = "renewal-reminders";

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Request notification permissions from the operating system
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === "granted";
    } catch {
        return false;
    }
}

/**
 * Configure interactive notification categories and actions.
 * Actions:
 * - "PAUSE_ACTION": allows pausing the subscription right from the notification banner
 * - "VIEW_ACTION": navigates user to the subscriptions tab
 */
export async function initializeNotificationCategories() {
    try {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync(RENEWAL_CHANNEL_ID, {
                name: "Renewal Reminders",
                importance: AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: colors.accent,
            });
        }

        await Notifications.setNotificationCategoryAsync(RENEWAL_CATEGORY_ID, [
            {
                identifier: "PAUSE_ACTION",
                buttonTitle: "Pause it",
                options: {
                    isDestructive: true,
                    opensAppToForeground: false,
                },
            },
            {
                identifier: "VIEW_ACTION",
                buttonTitle: "View Subscriptions",
                options: {
                    opensAppToForeground: true,
                },
            },
        ]);
    } catch {
        // Ignored in simulators or environments where native notifications are not available
    }
}

/**
 * Sets up the listener for notification response actions (when user taps buttons or notification).
 */
export function setupNotificationListeners(
    getToken: () => Promise<string | null>,
    onSubscriptionPaused?: () => void,
) {
    const subscription = Notifications.addNotificationResponseReceivedListener(
        async (response) => {
            const actionIdentifier = response.actionIdentifier;
            const data = response.notification.request.content.data;
            const subscriptionId = data?.subscriptionId ? String(data.subscriptionId) : null;
            const subscriptionName = data?.subscriptionName || "Subscription";

            if (actionIdentifier === "PAUSE_ACTION" && subscriptionId) {
                try {
                    await pauseSubscription(getToken, subscriptionId);
                    showSuccessToast(
                        "Subscription Paused",
                        `${subscriptionName} was paused to prevent renewal.`,
                    );
                    onSubscriptionPaused?.();
                } catch {
                    showErrorToast(
                        "Error",
                        `Could not pause ${subscriptionName}. Please check your connection.`,
                    );
                }
            } else if (
                actionIdentifier === "VIEW_ACTION" ||
                actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
            ) {
                router.push("/(tabs)/Subscriptions");
            }
        },
    );

    return () => subscription.remove();
}

/**
 * Cancel scheduled renewal notifications for a specific subscription ID
 */
export async function cancelSubscriptionNotifications(subscriptionId: string) {
    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            const notifSubId = notif.content.data?.subscriptionId;
            if (notifSubId && String(notifSubId) === String(subscriptionId)) {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }
    } catch {
        // Ignored if notifications unsupported
    }
}

/**
 * Schedule local warning notification for upcoming subscription renewals
 */
export async function scheduleRenewalNotification(
    subscription: Subscription,
    daysAhead: number = 1,
) {
    if (!subscription.renewalDate || subscription.status !== "active") {
        return;
    }

    const renewalTime = new Date(subscription.renewalDate).getTime();
    if (isNaN(renewalTime)) {
        return;
    }

    const triggerTime = renewalTime - daysAhead * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (triggerTime <= now) {
        return;
    }

    const milestoneLabel =
        daysAhead === 1
            ? "tomorrow"
            : daysAhead === 7
            ? "in 1 week"
            : daysAhead === 14
            ? "in 2 weeks"
            : `in ${daysAhead} days`;

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Upcoming Subscription Renewal",
                body: `${subscription.name} (${subscription.currency} ${subscription.price}) will renew ${milestoneLabel}. Pause or cancel it to avoid being charged.`,
                categoryIdentifier: RENEWAL_CATEGORY_ID,
                data: {
                    type: "RENEWAL_REMINDER",
                    subscriptionId: subscription.id,
                    subscriptionName: subscription.name,
                },
                ...(Platform.OS === "android" ? { channelId: RENEWAL_CHANNEL_ID } : {}),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(triggerTime),
            },
        });
    } catch {
        // Notification scheduling skipped if permission not granted
    }
}

/**
 * Synchronize all scheduled local notifications with the current subscriptions state.
 * Automatically handles:
 * - Cancelled / Deleted subscriptions (removed from notifications)
 * - Paused subscriptions (notifications cancelled)
 * - Updated subscriptions (rescheduled with new renewal date, frequency, or price)
 * - Added subscriptions (scheduled)
 */
export async function syncAllSubscriptionNotifications(subscriptions: Subscription[]) {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return;

        // Cancel all existing renewal reminders to avoid duplicates or stale data
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (
                notif.content.categoryIdentifier === RENEWAL_CATEGORY_ID ||
                notif.content.data?.type === "RENEWAL_REMINDER" ||
                notif.content.data?.subscriptionId
            ) {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }

        // Reschedule only for currently ACTIVE subscriptions with future renewal dates
        for (const sub of subscriptions) {
            if (sub.status === "active" && sub.renewalDate) {
                // Schedule reminder 1 day before renewal
                await scheduleRenewalNotification(sub, 1);
            }
        }
    } catch (err) {
        console.warn("Failed to sync notifications:", err);
    }
}

/* Test Notifications (for debugging) */
export async function sendTestNotificationNow() {
    await requestNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Test Renewal Reminder",
            body: "Netflix ($15.99) will renew tomorrow. Tap 'Pause it' to test.",
            categoryIdentifier: "RENEWAL_REMINDER",
            data: {
                type: "RENEWAL_REMINDER",
                subscriptionId: "your-sub-id", // replace with a real test ID
                subscriptionName: "Netflix",
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
        },
    });
}
