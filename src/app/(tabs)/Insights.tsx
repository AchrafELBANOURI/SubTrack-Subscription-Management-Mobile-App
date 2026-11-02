import {
    ActivityIndicator,
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
import { useExpenseInsightsQuery } from "../../../lib/expenseQueries";
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
                    onClose={() => setOptionsModalVisible(false)}
                />
            </View>
        </SafeScreen>
    );
}
