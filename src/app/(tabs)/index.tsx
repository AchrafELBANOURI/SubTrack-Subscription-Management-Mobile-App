import { FlatList, RefreshControl, Text, View } from "react-native";

import "../../../global.css";

import { posthog, posthogLogger } from "../../../lib/posthog";

import SafeScreen from "../../../components/SafeScreen";
import HomeHeader from "../../../components/home/HomeHeader";
import HomeBalanceCard from "../../../components/home/HomeBalanceCard";
import HomeUpcomingSubscriptions from "../../../components/home/HomeUpcomingSubscriptions";
import SubscriptionCard from "../../../components/home/SubscriptionCard";
import ListHeading from "../../../components/home/ListHeading";
import CreateSubscriptionModal from "../../../components/subscriptions/CreateSubscriptionModal";
import {
    useCreateSubscriptionMutation,
    useCurrentUserQuery,
    useSubscriptionsQuery,
} from "../../../lib/subscriptionQueries";
import { useSubscriptionUiStore } from "../../../stores/SubscriptionStore";
import { useExpenseInsightsQuery } from "../../../lib/expenseQueries";
import { colors } from "../../../constants/theme";
import { useUser } from "@clerk/expo";
import { useIsFocused } from "expo-router";

export default function Index() {
    const expandedSubId = useSubscriptionUiStore(
        (state) => state.expandedSubscriptionId,
    );
    const openModal = useSubscriptionUiStore((state) => state.openModal);
    const setExpandedSubscriptionId = useSubscriptionUiStore(
        (state) => state.setExpandedSubscriptionId,
    );
    const openCreateModal = useSubscriptionUiStore(
        (state) => state.openCreateModal,
    );
    const closeModal = useSubscriptionUiStore((state) => state.closeModal);

    const { user } = useUser();
    const { data: currentUser } = useCurrentUserQuery();

    const firstName = currentUser?.firstName ?? user?.firstName;
    const lastName = currentUser?.lastName ?? user?.lastName;
    const email = currentUser?.email ?? user?.emailAddresses[0].emailAddress;

    const fullName =
        firstName && lastName ? `${firstName} ${lastName}` : (email ?? "User");

    const {
        data: subscriptions = [],
        isPending: isSubscriptionsPending,
        refetch: refetchSubscription,
        isRefetching: isSubscriptionsRefetching,
    } = useSubscriptionsQuery();
    const createSubscriptionMutation = useCreateSubscriptionMutation();

    const {
        data: expenses,
        refetch: refetchExpenses,
        isRefetching: isExpensesRefetching,
    } = useExpenseInsightsQuery();

    const isFocused = useIsFocused();

    const handleRefresh = () => {
        refetchSubscription();
        refetchExpenses();
    };

    const handleCreateSubscription = async (newSubscription: Subscription) => {
        await createSubscriptionMutation.mutateAsync({
            name: newSubscription.name,
            price: newSubscription.price,
            currency: newSubscription.currency,
            frequency: newSubscription.frequency,
            frequencyPeriod: newSubscription.frequencyPeriod,
            plan: newSubscription.plan ?? undefined,
            category: newSubscription.category ?? undefined,
            status: newSubscription.status ?? undefined,
            paymentMethod: newSubscription.paymentMethod ?? undefined,
            startDate: newSubscription.startDate ?? undefined,
            renewalDate: newSubscription.renewalDate ?? undefined,
            color: newSubscription.color ?? undefined,
        });

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
                    refreshControl={
                        <RefreshControl
                            refreshing={
                                isFocused &&
                                (isExpensesRefetching ||
                                    isSubscriptionsRefetching)
                            }
                            onRefresh={handleRefresh}
                            tintColor={colors.accent}
                        />
                    }
                    renderItem={({ item: subscription }) => (
                        <SubscriptionCard
                            subscription={subscription}
                            modalOwner="home"
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
                                setExpandedSubscriptionId(
                                    isExpanding ? subscription.id : null,
                                );
                            }}
                        />
                    )}
                    ListHeaderComponent={
                        <>
                            <HomeHeader
                                fullName={fullName}
                                handlePressAddIcon={() =>
                                    openCreateModal("home")
                                }
                            />
                            <HomeBalanceCard
                                month={
                                    expenses?.month ||
                                    new Date().toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })
                                }
                                totalExpenses={expenses?.totalExpenses || 0}
                                currency={expenses?.currency || "USD"}
                            />
                            <HomeUpcomingSubscriptions />
                            <ListHeading title="All Subscriptions" />
                        </>
                    }
                    ListFooterComponent={<View className="mt-20"></View>}
                    keyExtractor={(item) => item.id.toString()}
                    style={{ marginHorizontal: -20 }}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <Text className="home-empty-state">
                            {isSubscriptionsPending
                                ? "Loading subscriptions..."
                                : "No Subscriptions yet."}
                        </Text>
                    )}
                    extraData={expandedSubId}
                />

                <CreateSubscriptionModal
                    visible={
                        openModal?.type === "create" &&
                        openModal.owner === "home"
                    }
                    onClose={closeModal}
                    onSubmit={handleCreateSubscription}
                />
            </View>
        </SafeScreen>
    );
}
