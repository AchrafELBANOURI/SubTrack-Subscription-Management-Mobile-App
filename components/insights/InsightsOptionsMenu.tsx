import { Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import {
    useCheckRemindersMutation,
    useDeleteAllExpensesMutation,
    useProcessRenewalsMutation,
} from "../../lib/expenseQueries";
import { useInsightsUiStore } from "../../stores/InsightsStore";

interface InsightsOptionsMenuProps {
    visible: boolean;
    onClose: () => void;
}

export default function InsightsOptionsMenu({
    visible,
    onClose,
}: InsightsOptionsMenuProps) {
    const processRenewalsMutation = useProcessRenewalsMutation();
    const checkRemindersMutation = useCheckRemindersMutation();
    const deleteAllExpensesMutation = useDeleteAllExpensesMutation();

    const isClearExpensesHistoryConfirmationModalVisible =
        useInsightsUiStore(
            (state) => state.isClearExpensesHistoryConfirmationModalVisible,
        );

    const setClearExpensesHistoryConfirmationModalVisible =
        useInsightsUiStore(
            (state) =>
                state.setClearExpensesHistoryConfirmationModalVisible,
        );

    const handleProcessRenewals = async () => {
        await processRenewalsMutation.mutateAsync();
        onClose();
    };

    const handleCheckReminders = async () => {
        await checkRemindersMutation.mutateAsync();
        onClose();
    };

    const handleClearExpenses = async () => {
        await deleteAllExpensesMutation.mutateAsync();
        setClearExpensesHistoryConfirmationModalVisible(false);
        onClose();
    };

    const isPending =
        processRenewalsMutation.isPending ||
        checkRemindersMutation.isPending ||
        deleteAllExpensesMutation.isPending;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable className="modal-overlay" onPress={onClose}>
                <View className="modal-container p-5">
                    <View className="flex-row items-center justify-between pb-4 border-b border-border">
                        <Text className="text-xl font-sans-bold text-primary">
                            Renewal & Insights Actions
                        </Text>
                        <Pressable
                            className="modal-close"
                            onPress={onClose}
                            accessibilityLabel="Close"
                        >
                            <Text className="modal-close-text">X</Text>
                        </Pressable>
                    </View>

                    <View className="py-4 gap-3">
                        <Pressable
                            className="rounded-2xl bg-accent p-4 items-center justify-center flex-row gap-2"
                            onPress={handleProcessRenewals}
                            disabled={isPending}
                        >
                            {processRenewalsMutation.isPending && (
                                <ActivityIndicator color="#081126" size="small" />
                            )}
                            <Text className="text-base font-sans-bold text-primary">
                                Process Due Renewals
                            </Text>
                        </Pressable>

                        <Pressable
                            className="rounded-2xl border border-primary/20 bg-background p-4 items-center justify-center flex-row gap-2"
                            onPress={handleCheckReminders}
                            disabled={isPending}
                        >
                            {checkRemindersMutation.isPending && (
                                <ActivityIndicator color="#081126" size="small" />
                            )}
                            <Text className="text-base font-sans-bold text-primary">
                                Check & Dispatch Email Reminders
                            </Text>
                        </Pressable>

                        <Pressable
                            className="rounded-2xl border border-primary/20 bg-background p-4 items-center justify-center"
                            onPress={() => setClearExpensesHistoryConfirmationModalVisible(true)}
                            disabled={isPending}
                        >
                            <Text className="text-base font-sans-bold text-primary">
                                Clear Expense And Subscription History
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Pressable>

            <Modal
                visible={isClearExpensesHistoryConfirmationModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setClearExpensesHistoryConfirmationModalVisible(false)}
            >
                <Pressable
                    className="modal-overlay justify-center items-center"
                    onPress={() => setClearExpensesHistoryConfirmationModalVisible(false)}
                >
                    <Pressable
                        className="w-[50%] bg-background rounded-3xl p-5"
                        onPress={(event) => event.stopPropagation()}
                    >
                        <Text className="text-xl font-sans-bold text-primary">
                            Clear expense and subscription history?
                        </Text>
                        <Text className="text-base text-muted-foreground mt-3">
                            This permanently deletes all recorded expenses and subscriptions for
                            your account.
                        </Text>
                        <View className="flex-row justify-end gap-3 mt-6">
                            <Pressable
                                className="auth-secondary-button px-4"
                                onPress={() => setClearExpensesHistoryConfirmationModalVisible(false)}
                                disabled={deleteAllExpensesMutation.isPending}
                            >
                                <Text className="auth-secondary-button-text">
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                className="auth-button bg-destructive px-4"
                                onPress={() => void handleClearExpenses()}
                                disabled={deleteAllExpensesMutation.isPending}
                            >
                                {deleteAllExpensesMutation.isPending ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text className="auth-button-text text-white">
                                        Clear history
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </Modal>
    );
}
