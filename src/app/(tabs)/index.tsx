import { useState } from "react";
import { FlatList, Text, View } from "react-native";

import "../../../global.css";

import { posthog, posthogLogger } from "../../../lib/posthog";

import SafeScreen from "../../../components/SafeScreen";
import HomeHeader from "../../../components/home/HomeHeader";
import HomeBalanceCard from "../../../components/home/HomeBalanceCard";
import HomeUpcomingSubscriptions from "../../../components/home/HomeUpcomingSubscriptions";
import SubscriptionCard from "../../../components/home/SubscriptionCard";
import ListHeading from "../../../components/home/ListHeading";
import CreateSubscriptionModal from "../../../components/CreateSubscriptionModal";
import { useSubscriptionStore } from "../../../stores/SubscriptionStore";

export default function Index() {
    const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { subscriptions, addSubscription } = useSubscriptionStore();

    const handleCreateSubscription = (newSubscription: Subscription) => {
        addSubscription(newSubscription);

        posthog?.capture("subscription_created", {
            subscription_name: newSubscription.name,
            subscription_price: newSubscription.price,
            subscription_frequency: newSubscription.frequency!,
            subscription_category: newSubscription.category!,
        });
    };

    return (
        <SafeScreen
            className="flex-1 bg-background"
            edges={["top", "left", "right"]}
        >
            <View className="screen-container">
                <FlatList
                    data={subscriptions}
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
                                    isExpanding
                                        ? subscription.id.toString()
                                        : null,
                                );
                            }}
                        />
                    )}
                    ListHeaderComponent={
                        <>
                            <HomeHeader
                                handlePressAddIcon={() =>
                                    setIsModalVisible(true)
                                }
                            />
                            <HomeBalanceCard />
                            <HomeUpcomingSubscriptions />
                            <ListHeading title="All Subscriptions" />
                        </>
                    }
                    ListFooterComponent={<View className="mt-20"></View>}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <Text className="home-empty-state">
                            No Subscriptions yet.
                        </Text>
                    )}
                    extraData={expandedSubId}
                />

                <CreateSubscriptionModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onSubmit={handleCreateSubscription}
                />
            </View>
        </SafeScreen>
    );
}
