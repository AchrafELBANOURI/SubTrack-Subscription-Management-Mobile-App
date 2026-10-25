import { View, FlatList, Text } from "react-native";
import { UPCOMING_SUBSCRIPTIONS } from "../../constants/data";
import UpcomingSubscriptionCard from "./UpcomingSubscriptionCard";
import ListHeading from "./ListHeading";

const HomeUpcomingSubscriptions = () => {
    return (
        <View>
            <ListHeading title="Upcoming" />

            <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item: subscription }) => (
                    <UpcomingSubscriptionCard
                        upcomingSubscriptionDetail={subscription}
                    />
                )}
                keyExtractor={(item) => item.id}
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
