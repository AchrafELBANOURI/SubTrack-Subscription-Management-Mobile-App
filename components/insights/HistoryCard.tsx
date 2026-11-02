import { Image, Text, View } from "react-native";
import { icons } from "../../constants/icons";
import { formatCurrency, formatHistoryDate, getLogoUrl } from "../../lib/uttils";

interface HistoryCardProps {
    expense: Expense;
    index: number;
}

export default function HistoryCard({ expense, index }: HistoryCardProps) {
    const cardClassName = index % 2 === 0
        ? "history-card-yellow"
        : "history-card-mint";

    const logoUrl = expense.icon ? getLogoUrl(expense.icon) : null;

    return (
        <View className={cardClassName}>
            <View className="flex-row items-center flex-1">
                <View className="history-icon-wrapper">
                    <Image
                        source={logoUrl ? { uri : logoUrl} : icons.plus}
                        className="history-icon"
                        resizeMode="contain"
                    />
                </View>

                <View className="history-details">
                    <Text className="history-name" numberOfLines={1}>
                        {expense.name}
                    </Text>
                    <Text className="history-date">
                        {formatHistoryDate(expense.billingDate)}
                    </Text>
                </View>
            </View>

            <View className="history-pricing">
                <Text className="history-amount">
                    {formatCurrency(expense.amount, expense.currency)}
                </Text>
                <Text className="history-period">
                    {expense.frequency?.toLowerCase() || "month"}
                </Text>
            </View>
        </View>
    );
}
