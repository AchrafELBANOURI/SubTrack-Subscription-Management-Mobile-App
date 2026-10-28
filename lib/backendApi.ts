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

    const response = await fetch(`${getApiUrl()}${path}`, {
        ...options,
        headers,
    });

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
    subscriptionId: number,
    subscription: SubscriptionPayload,
) =>
    requestApi<Subscription>(
        `/api/subscriptions/${subscriptionId}`,
        getToken,
        {
            method: "PUT",
            body: JSON.stringify(subscription),
        },
    );

export const deleteSubscription = (
    getToken: GetToken,
    subscriptionId: number,
) =>
    requestApi<void>(`/api/subscriptions/${subscriptionId}`, getToken, {
        method: "DELETE",
    });
