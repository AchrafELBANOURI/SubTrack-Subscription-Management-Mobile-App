import { Text, View, TextInput, FlatList, RefreshControl } from "react-native";
import { SubscriptionCard } from "@home";
import SafeScreen from "../../../components/SafeScreen";
import {
    useCreateSubscriptionMutation,
    useSubscriptionsQuery,
} from "../../../lib/subscriptionQueries";
import { useSubscriptionUiStore } from "../../../stores/SubscriptionStore";
import { posthog } from "../../../lib/posthog";
import CreateSubscriptionModal from "../../../components/subscriptions/CreateSubscriptionModal";
import { colors } from "../../../constants/theme";
import { useIsFocused } from "expo-router";
import SubscriptionsHeader from "../../../components/subscriptions/SubscriptionsHeader";

const Subscriptions = () => {
    const {
        searchQuery,
        setSearchQuery,
        expandedSubscriptionId: expandedId,
        toggleExpandedSubscriptionId,
        isCreateModalVisible,
        setCreateModalVisible,
    } = useSubscriptionUiStore();

    const {
        data: subscriptions = [],
        isPending,
        refetch,
        isRefetching,
    } = useSubscriptionsQuery();
    const createSubscriptionMutation = useCreateSubscriptionMutation();

    const isFocused = useIsFocused();

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

    const filteredSubscriptions = subscriptions.filter(
        (subscription) =>
            subscription.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            subscription.category
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            subscription.frequency
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    return (
        <SafeScreen className="flex-1 bg-background">
            <SubscriptionsHeader
                onAddPress={() => setCreateModalVisible(true)}
            />
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={isFocused && isRefetching}
                        onRefresh={() => {
                            void refetch();
                        }}
                        tintColor={colors.accent}
                        progressBackgroundColor={colors.primary}
                    />
                }
                ListHeaderComponent={
                    <View>
                        <TextInput
                            className="bg-card rounded-xl px-4 py-3 text-dark mb-4"
                            placeholder="Search subscriptions..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {isPending && <Text>Loading subscriptions...</Text>}
                    </View>
                }
                renderItem={({ item: subscription }) => (
                    <SubscriptionCard
                        subscription={subscription}
                        expanded={expandedId === subscription.id}
                        onPress={() =>
                            toggleExpandedSubscriptionId(subscription.id)
                        }
                    />
                )}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                    gap: 12,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag" // KeyboardAvoidingView Like behavior
            />
            <CreateSubscriptionModal
                visible={isCreateModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSubmit={handleCreateSubscription}
            />
        </SafeScreen>
    );
};
export default Subscriptions;
