import { View, Text, Image } from "react-native";
import { formatCurrency } from "../lib/uttils";

const UpcomingSubscriptionCard = ({
    upcomingSubscriptionDetail,
}: {
    upcomingSubscriptionDetail: UpcomingSubscriptionCardProps;
}) => {
    const { name, price, daysLeft, icon } = upcomingSubscriptionDetail;

    return (
        <View className="upcoming-card">
            <View className="upcoming-row">
                <Image source={icon} className="upcoming-icon" />

                <View>
                    <Text className="upcoming-price">
                        {formatCurrency(price)}
                    </Text>
                    <Text className="upcoming-meta" numberOfLines={1}>
                        {daysLeft > 1 ? `${daysLeft} days left` : "Last Day"}
                    </Text>
                </View>
            </View>

            <Text className="upcoming-name" numberOfLines={1}>
                {name}
            </Text>
        </View>
    );
};

export default UpcomingSubscriptionCard;
