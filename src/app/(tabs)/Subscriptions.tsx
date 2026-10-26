import { Text, View, TextInput, FlatList } from "react-native";
import { useState } from "react";
import { SubscriptionCard } from "@home";
import SafeScreen from "../../../components/SafeScreen";
import { useSubscriptionStore } from "../../../stores/SubscriptionStore";

const Subscriptions = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const subscriptions = useSubscriptionStore((state) => state.subscriptions);

    const filteredSubscriptions = subscriptions.filter(
        (subscription) =>
            subscription.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            subscription.category
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            subscription.plan
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    return (
        <SafeScreen className="flex-1 bg-background">
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View className="px-5 pt-5">
                        <Text className="text-3xl font-bold text-dark mb-5">
                            Subscriptions
                        </Text>
                        <TextInput
                            className="bg-card rounded-xl px-4 py-3 text-dark mb-4"
                            placeholder="Search subscriptions..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                }
                renderItem={({ item: subscription }) => (
                    <SubscriptionCard
                        {...subscription}
                        expanded={expandedId === subscription.id}
                        onPress={() =>
                            setExpandedId(
                                expandedId === subscription.id
                                    ? null
                                    : subscription.id,
                            )
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
        </SafeScreen>
    );
};
export default Subscriptions;
