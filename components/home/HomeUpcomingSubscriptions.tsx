import { View, FlatList, Text } from "react-native";
import UpcomingSubscriptionCard from "./UpcomingSubscriptionCard";
import ListHeading from "./ListHeading";
import { useSubscriptionsQuery } from "../../lib/subscriptionQueries";

const HomeUpcomingSubscriptions = () => {
    const { data: subscriptions = [] } = useSubscriptionsQuery();

    const upcomingSubscriptions = subscriptions
        .filter((s) => new Date(s.renewalDate!) >= new Date())
        .sort(
            (a, b) =>
                new Date(a.renewalDate!).getTime() -
                new Date(b.renewalDate!).getTime(),
        )
        .slice(0, 5);
    return (
        <View>
            <ListHeading title="Upcoming" />

            <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item: subscription }) => (
                    <UpcomingSubscriptionCard
                        upcomingSubscriptionDetail={subscription}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <Text className="home-empty-state">
                        No Upcoming Subscriptions.
                    </Text>
                )}
            />
        </View>
    );
};

export default HomeUpcomingSubscriptions;
