import { useState } from "react";
import { FlatList, Text, View } from "react-native";

import "../../../global.css";

import { HOME_SUBSCRIPTIONS } from "../../../constants/data";

import SafeScreen from "../../../components/SafeScreen";
import HomeHeader from "../../../components/home/HomeHeader";
import HomeBalanceCard from "../../../components/home/HomeBalanceCard";
import HomeUpcomingSubscriptions from "../../../components/home/HomeUpcomingSubscriptions";
import SubscriptionCard from "../../../components/home/SubscriptionCard";
import ListHeading from "../../../components/home/ListHeading";
import { posthog, posthogLogger } from "../../../lib/posthog";

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
                            onPress={() => {
                                const isExpanding =
                                    expandedSubId !== subscription.id;

                                posthog?.capture(
                                    isExpanding
                                        ? "subscription_expanded"
                                        : "subscription_collapsed",
                                    {
                                        subscription_id: subscription.id,
                                        expanded: isExpanding,
                                    },
                                );
                                posthogLogger.info("subscription expanded", {
                                    subscription_id: subscription.id,
                                    expanded: isExpanding,
                                });
                                setExpandedSubId(
                                    isExpanding ? subscription.id : null,
                                );
                            }}
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
