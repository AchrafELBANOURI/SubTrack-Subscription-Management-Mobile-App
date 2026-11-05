import { Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import {
    useCheckRemindersMutation,
    useProcessRenewalsMutation,
} from "../../lib/expenseQueries";

interface InsightsOptionsMenuProps {
    visible: boolean;
    setClearExpensesHistoryConfirmationModalVisible : (visible: boolean) => void;
    onClose: () => void;
}

export default function InsightsOptionsMenu({
    visible,
    setClearExpensesHistoryConfirmationModalVisible,
    onClose,
}: InsightsOptionsMenuProps) {
    const processRenewalsMutation = useProcessRenewalsMutation();
    const checkRemindersMutation = useCheckRemindersMutation();

    const handleProcessRenewals = async () => {
        await processRenewalsMutation.mutateAsync();
        onClose();
    };

    const handleCheckReminders = async () => {
        await checkRemindersMutation.mutateAsync();
        onClose();
    };

    const isPending =
        processRenewalsMutation.isPending ||
        checkRemindersMutation.isPending;

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
                            onPress={() => {onClose() ; setClearExpensesHistoryConfirmationModalVisible(true)}}
                            disabled={isPending}
                        >
                            <Text className="text-base font-sans-bold text-primary">
                                Clear Expense And Subscription History
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}
