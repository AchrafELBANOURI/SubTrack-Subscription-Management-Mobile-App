import { View, Text, Image } from "react-native";
import { formatCurrency, getLogoUrl } from "../../lib/uttils";
import dayjs from "dayjs";
import { icons } from "../../constants/icons";

const UpcomingSubscriptionCard = ({
    upcomingSubscriptionDetail,
}: {
    upcomingSubscriptionDetail: Pick<
        Subscription,
        "name" | "price" | "currency" | "icon" | "renewalDate"
    >;
}) => {
    const { name, price, currency, icon, renewalDate } =
        upcomingSubscriptionDetail;

    const logoUrl = icon ? getLogoUrl(icon) : null;

    const daysLeft =
        renewalDate !== null && renewalDate !== undefined
            ? dayjs(renewalDate).diff(dayjs(), "day")
            : null;

    const daysLeftLabel =
        daysLeft === null
            ? "No renewal date"
            : daysLeft <= 0
              ? "Last day"
              : daysLeft === 1
                ? "1 day left"
                : `${daysLeft} days left`;
    return (
        <View className="upcoming-card">
            <View className="upcoming-row">
                <Image
                    source={logoUrl ? { uri: logoUrl } : icons.plus}
                    className="upcoming-icon"
                />

                <View>
                    <Text className="upcoming-price">
                        {formatCurrency(price, currency)}
                    </Text>
                    <Text className="upcoming-meta" numberOfLines={1}>
                        {daysLeftLabel}
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
