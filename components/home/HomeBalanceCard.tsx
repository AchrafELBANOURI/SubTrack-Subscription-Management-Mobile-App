import { View, Text } from "react-native";
import { formatCurrency } from "../../lib/uttils";

type HomeBalanceCardProps = {
    totalExpenses: number;
    month: string;
    currency: string;
};

const HomeBalanceCard = ({totalExpenses,month,currency}: HomeBalanceCardProps) => {

    const formattedAmount = `-${formatCurrency(totalExpenses, currency)}`;

    return (
        <View className="home-balance-card">
            <Text className="home-balance-label">Expenses</Text>

            <View className="home-balance-row">
                <Text className="home-balance-amount">
                    {formattedAmount}
                </Text>
                <Text className="home-balance-date">
                    {month}
                </Text>
            </View>
        </View>
    );
};

export default HomeBalanceCard;
