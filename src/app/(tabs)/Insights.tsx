import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import SafeScreen from "../../../components/SafeScreen";
import ExpensesSummaryCard from "../../../components/insights/ExpensesSummaryCard";
import HistoryCard from "../../../components/insights/HistoryCard";
import InsightsChart from "../../../components/insights/InsightsChart";
import InsightsHeader from "../../../components/insights/InsightsHeader";
import InsightsOptionsMenu from "../../../components/insights/InsightsOptionsMenu";
import { useDeleteAllExpensesMutation, useExpenseInsightsQuery } from "../../../lib/expenseQueries";
import { useInsightsUiStore } from "../../../stores/InsightsStore";
import "../../../global.css";
import { colors } from "../../../constants/theme";
import { useIsFocused } from "expo-router";

export default function Insights() {
    const {
        selectedDay,
        isOptionsModalVisible,
        showAllHistory,
        setSelectedDay,
        setOptionsModalVisible,
        toggleAllHistory,
    } = useInsightsUiStore();

    const {
        data: insights,
        isLoading,
        refetch,
        isRefetching,
    } = useExpenseInsightsQuery();

    const isFocused = useIsFocused();

    const weeklyData =
        insights?.weeklyUpcoming && insights.weeklyUpcoming.length === 7
            ? insights.weeklyUpcoming
            : [];

    const historyItems =
        insights?.history && insights.history.length > 0
            ? insights.history
            : [];

    const displayedHistory = showAllHistory
        ? historyItems
        : historyItems.slice(0, 3);

    const isClearExpensesHistoryConfirmationModalVisible =
        useInsightsUiStore(
            (state) => state.isClearExpensesHistoryConfirmationModalVisible,
        );

    const setClearExpensesHistoryConfirmationModalVisible =
        useInsightsUiStore(
            (state) =>
                state.setClearExpensesHistoryConfirmationModalVisible,
        );

    const deleteAllExpensesMutation = useDeleteAllExpensesMutation();

    const handleClearExpenses = async () => {
        try {
            await deleteAllExpensesMutation.mutateAsync();
        } finally {
            setClearExpensesHistoryConfirmationModalVisible(false);
        }
    };


    return (
        <SafeScreen
            className="flex-1 bg-background"
            edges={["top", "left", "right"]}
        >
            <View className="screen-container">
                <InsightsHeader
                    onOptionsPress={() => setOptionsModalVisible(true)}
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isFocused && isRefetching}
                            onRefresh={() => {
                                void refetch();
                            }}
                            tintColor={colors.accent}
                            progressBackgroundColor={colors.primary}
                        />
                    }
                >
                    {/* Section: This Week Expenses */}
                    <View className="my-3 flex-row items-center justify-between">
                        <Text className="text-2xl font-sans-bold text-primary">
                            Week expenses
                        </Text>
                    </View>

                    {/* Weekly Bar Chart with Animations */}
                    <InsightsChart
                        data={weeklyData}
                        selectedDay={selectedDay}
                        onSelectDay={setSelectedDay}
                    />

                    {/* Expenses Summary Card */}
                    <ExpensesSummaryCard
                        month={
                            insights?.month ||
                            new Date().toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })
                        }
                        totalAmount={insights?.totalExpenses || 0.0}
                        percentageChange={insights?.percentageChange || 0}
                        currency={insights?.currency || "USD"}
                    />

                    {/* Section: History */}
                    <View className="my-3 flex-row items-center justify-between">
                        <Text className="text-2xl font-sans-bold text-primary">
                            History
                        </Text>
                        <Pressable
                            className="list-action"
                            onPress={toggleAllHistory}
                        >
                            <Text className="list-action-text">
                                {showAllHistory ? "Show less" : "View all"}
                            </Text>
                        </Pressable>
                    </View>

                    {/* History List */}
                    {isLoading && !insights ? (
                        <View className="py-8 items-center justify-center">
                            <ActivityIndicator
                                color={colors.accent}
                                size="small"
                            />
                        </View>
                    ) : (
                        displayedHistory.map((expense, index) => (
                            <HistoryCard
                                key={`${expense.id}-${index}`}
                                expense={expense}
                                index={index}
                            />
                        ))
                    )}
                </ScrollView>

                {/* Options Action Menu */}
                <InsightsOptionsMenu
                    visible={isOptionsModalVisible}
                    setClearExpensesHistoryConfirmationModalVisible={setClearExpensesHistoryConfirmationModalVisible}
                    onClose={() => setOptionsModalVisible(false)}
                />

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
                            className="w-[95%] md:w-3/4 bg-background rounded-3xl p-5"
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
            </View>
        </SafeScreen>
    );
}
