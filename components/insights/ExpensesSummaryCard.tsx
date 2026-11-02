import { Text, View } from "react-native";
import { formatCurrency } from "../../lib/uttils";

interface ExpensesSummaryCardProps {
    month: string;
    totalAmount: number;
    percentageChange: number;
    currency: string;
}

export default function ExpensesSummaryCard({
    month,
    totalAmount,
    percentageChange,
    currency,
}: ExpensesSummaryCardProps) {
    const formattedAmount = `-${formatCurrency(totalAmount, currency)}`;
    const isPositive = percentageChange >= 0;
    const formattedPercentage = `${isPositive ? "+" : ""}${Math.round(
        percentageChange
    )}%`;

    return (
        <View className="insights-expenses-card">
            <View>
                <Text className="insights-expenses-title">Expenses</Text>
                <Text className="insights-expenses-date">{month}</Text>
            </View>

            <View className="items-end">
                <Text className="insights-expenses-amount">{formattedAmount}</Text>
                <Text className="insights-expenses-percent">
                    {formattedPercentage}
                </Text>
            </View>
        </View>
    );
}
