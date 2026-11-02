import { useAuth } from "@clerk/expo";
import { showErrorToast } from "./toast";

type GetToken = () => Promise<string | null>;

export class BackendApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = "BackendApiError";
    }
}

const getApiUrl = () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

    if (!apiUrl) {
        throw new Error("EXPO_PUBLIC_API_URL is not configured");
    }

    return apiUrl.replace(/\/$/, "");
};

async function requestApi<T>(
    path: string,
    getToken: GetToken,
    options: RequestInit = {},
): Promise<T> {
    const token = await getToken();

    if (!token) {
        throw new BackendApiError(401, "No Clerk session token available");
    }

    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${token}`);

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    let response: Response;

    try {
        response = await fetch(`${getApiUrl()}${path}`, {
            ...options,
            headers,
        });
    } catch {
        showErrorToast("Unable to connect to the backend.");

        throw new BackendApiError(0, "Unable to connect to the backend.");
    }

    if (!response.ok) {
        const message = await response.text();
        throw new BackendApiError(
            response.status,
            message || `Backend request failed with status ${response.status}`,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export const getCurrentUser = (getToken: GetToken) =>
    requestApi<User>("/api/me", getToken);

export const getSubscriptions = (getToken: GetToken) =>
    requestApi<Subscription[]>("/api/subscriptions", getToken);

export const createSubscription = (
    getToken: GetToken,
    subscription: SubscriptionPayload,
) =>
    requestApi<Subscription>("/api/subscriptions", getToken, {
        method: "POST",
        body: JSON.stringify(subscription),
    });

export const updateSubscription = (
    getToken: GetToken,
    subscriptionId: string,
    subscription: SubscriptionPayload,
) =>
    requestApi<Subscription>(`/api/subscriptions/${subscriptionId}`, getToken, {
        method: "PUT",
        body: JSON.stringify(subscription),
    });

export const deleteSubscription = (
    getToken: GetToken,
    subscriptionId: string,
) =>
    requestApi<void>(`/api/subscriptions/${subscriptionId}`, getToken, {
        method: "DELETE",
    });

export const pauseSubscription = (getToken: GetToken, subscriptionId: string) =>
    requestApi<void>(
        `/api/subscriptions/${subscriptionId}/status/paused`,
        getToken,
        {
            method: "PATCH",
        },
    );

export const activateSubscription = (
    getToken: GetToken,
    subscriptionId: string,
) =>
    requestApi<void>(
        `/api/subscriptions/${subscriptionId}/status/active`,
        getToken,
        {
            method: "PATCH",
        },
    );

export const getExpenseInsights = (getToken: GetToken) =>
    requestApi<ExpenseInsights>("/api/expenses/insights", getToken);

export const getExpenses = (getToken: GetToken) =>
    requestApi<Expense[]>("/api/expenses", getToken);

export const deleteAllExpenses = (getToken: GetToken) =>
    requestApi<void>("/api/expenses", getToken, {
        method: "DELETE",
    });

export const processDueRenewals = (getToken: GetToken) =>
    requestApi<void>("/api/expenses/process-renewals", getToken, {
        method: "POST",
    });

export const checkRenewalReminders = (getToken: GetToken) =>
    requestApi<{ status: string; remindersSent: number }>(
        "/api/notifications/check-reminders",
        getToken,
        {
            method: "POST",
        },
    );
