import { View, Text } from "react-native";
import { formatCurrency, formatSubscriptionDateTime } from "../../lib/uttils";
import { HOME_BALANCE } from "../../constants/data";

const HomeBalanceCard = () => {
    return (
        <View className="home-balance-card">
            <Text className="home-balance-label">Balance</Text>

            <View className="home-balance-row">
                <Text className="home-balance-amount">
                    {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                    {formatSubscriptionDateTime(HOME_BALANCE.nextRenewalDate)}
                </Text>
            </View>
        </View>
    );
};

export default HomeBalanceCard;
