import { useState } from "react";
import { FlatList, Text, View } from "react-native";

import "../../../global.css";

import { HOME_SUBSCRIPTIONS } from "../../../constants/data";

import SafeScreen from "../../../components/SafeScreen";
import HomeHeader from "../../../components/HomeHeader";
import HomeBalanceCard from "../../../components/HomeBalanceCard";
import HomeUpcomingSubscriptions from "../../../components/HomeUpcomingSubscriptions";
import SubscriptionCard from "../../../components/SubscriptionCard";
import ListHeading from "../../../components/ListHeading";

export default function Index() {
    const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

    return (
        <SafeScreen
            className="flex-1 bg-background"
            edges={["top", "left", "right"]}
        >
            <View className="screen-container">
                <FlatList
                    data={HOME_SUBSCRIPTIONS}
                    renderItem={({ item: subscription }) => (
                        <SubscriptionCard
                            {...subscription}
                            expanded={expandedSubId === subscription.id}
                            onPress={() =>
                                setExpandedSubId((currentId) =>
                                    currentId === subscription.id
                                        ? null
                                        : subscription.id,
                                )
                            }
                        />
                    )}
                    ListHeaderComponent={
                        <>
                            <HomeHeader />
                            <HomeBalanceCard />
                            <HomeUpcomingSubscriptions />
                            <ListHeading title="All Subscriptions" />
                        </>
                    }
                    ListFooterComponent={<View className="mt-20"></View>}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <Text className="home-empty-state">
                            No Subscriptions yet.
                        </Text>
                    )}
                    extraData={expandedSubId}
                />
            </View>
        </SafeScreen>
    );
}
