import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    createSubscription,
    deleteSubscription,
    getCurrentUser,
    getSubscriptions,
    updateSubscription,
} from "./backendApi";

export const currentUserQueryKey = ["current-user"] as const;
export const subscriptionsQueryKey = ["subscriptions"] as const;

export const useCurrentUserQuery = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: currentUserQueryKey,
        queryFn: () => getCurrentUser(getToken),
        enabled: isLoaded && isSignedIn,
        staleTime: 5 * 60 * 1000,
    });
};

export const useSubscriptionsQuery = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: subscriptionsQueryKey,
        queryFn: () => getSubscriptions(getToken),
        enabled: isLoaded && isSignedIn,
        staleTime: 30 * 1000,
    });
};

export const useCreateSubscriptionMutation = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (subscription: SubscriptionPayload) =>
            createSubscription(getToken, subscription),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey }),
    });
};

export const useUpdateSubscriptionMutation = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            subscriptionId,
            subscription,
        }: {
            subscriptionId: number;
            subscription: SubscriptionPayload;
        }) => updateSubscription(getToken, subscriptionId, subscription),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey }),
    });
};

export const useDeleteSubscriptionMutation = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (subscriptionId: number) =>
            deleteSubscription(getToken, subscriptionId),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey }),
    });
};
