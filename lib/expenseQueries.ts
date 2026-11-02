import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    checkRenewalReminders,
    deleteAllExpenses,
    getExpenseInsights,
    getExpenses,
    processDueRenewals,
} from "./backendApi";
import { subscriptionsQueryKey } from "./subscriptionQueries";
import { getErrorMessage, showErrorToast, showSuccessToast } from "./toast";

export const expenseInsightsQueryKey = ["expense-insights"] as const;
export const expensesQueryKey = ["expenses"] as const;

export const useExpenseInsightsQuery = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: expenseInsightsQueryKey,
        queryFn: () => getExpenseInsights(getToken),
        enabled: isLoaded && isSignedIn,
        staleTime: 30 * 1000,
    });
};

export const useExpensesQuery = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: expensesQueryKey,
        queryFn: () => getExpenses(getToken),
        enabled: isLoaded && isSignedIn,
        staleTime: 60 * 1000,
    });
};

export const useProcessRenewalsMutation = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => processDueRenewals(getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expenseInsightsQueryKey });
            queryClient.invalidateQueries({ queryKey: expensesQueryKey });
            queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });
        },
        onError: (error) => {
            showErrorToast("Renewal Check Failed", getErrorMessage(error));
        },
    });
};

export const useCheckRemindersMutation = () => {
    const { getToken } = useAuth();

    return useMutation({
        mutationFn: () => checkRenewalReminders(getToken),
        onSuccess: (data) => {
            if (data?.remindersSent && data.remindersSent > 0) {
                showSuccessToast(
                    "Reminders Checked",
                    `${data.remindersSent} reminder notification(s) dispatched.`,
                );
            }
        },
    });
};

export const useDeleteAllExpensesMutation = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteAllExpenses(getToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: expenseInsightsQueryKey });
            queryClient.invalidateQueries({ queryKey: expensesQueryKey });
            showSuccessToast(
                "Expense history cleared",
                "Your subscriptions were kept and future expenses can still be tracked.",
            );
        },
        onError: (error) => {
            showErrorToast("Could not clear expense history", getErrorMessage(error));
        },
    });
};
