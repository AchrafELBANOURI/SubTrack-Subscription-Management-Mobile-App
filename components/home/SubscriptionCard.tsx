import { View, Text, Image, Pressable, TouchableOpacity } from "react-native";
import {
    formatCurrency,
    formatStatusLabel,
    formatSubscriptionDateTime,
    getLogoUrl,
} from "../../lib/uttils";
import { clsx } from "clsx";
import { icons } from "../../constants/icons";
import UpdateSubscriptionModal from "../UpdateSubscriptionModal";
import { useSubscriptionUiStore } from "../../stores/SubscriptionStore";
import {
    useActivateSubscriptionMutation,
    useDeleteSubscriptionMutation,
    usePauseSubscriptionMutation,
    useUpdateSubscriptionMutation,
} from "../../lib/subscriptionQueries";
import { posthog } from "../../lib/posthog";
import DeleteSubscriptionModal from "../DeleteSubscriptionModal";
import { useState } from "react";

type SubscriptionCardProps = {
    subscription: Subscription;
    expanded: boolean;
    onPress: () => void;
};

const SubscriptionCard = ({
    subscription,
    onPress,
    expanded,
}: SubscriptionCardProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isUpdateModalVisible, setUpdateModalVisible } =
        useSubscriptionUiStore();

    const { isDeleteModalVisible, setDeleteModalVisible } =
        useSubscriptionUiStore();

    const updateSubscriptionMutation = useUpdateSubscriptionMutation();
    const deleteSubscriptionMutation = useDeleteSubscriptionMutation();
    const pauseSubscriptionMutation = usePauseSubscriptionMutation();
    const activateSubscriptionMutation = useActivateSubscriptionMutation();

    const handleUpdateSubscription = async (
        subscriptionId: string,
        updatedSubscription: SubscriptionPayload,
    ) => {
        await updateSubscriptionMutation.mutateAsync({
            subscriptionId,
            subscription: updatedSubscription,
        });

        posthog?.capture("subscription_updated", {
            subscription_name: updatedSubscription.name,
            subscription_price: updatedSubscription.price,
            subscription_frequency: updatedSubscription.frequency!,
            subscription_category: updatedSubscription.category!,
        });
    };

    const handleDeleteSubscription = async (subscriptionId: string) => {
        await deleteSubscriptionMutation.mutateAsync(subscriptionId);

        posthog?.capture("subscription_removed", {
            subscription_name: subscription.name,
        });
    };

    const handleChangeStatus = async (
        subscriptionId: string,
        status: Status,
    ) => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const statusMutator =
                status === "paused"
                    ? activateSubscriptionMutation
                    : pauseSubscriptionMutation;
            await statusMutator.mutateAsync(subscriptionId);

            posthog?.capture("subscription_status_changed", {
                subscription_name: subscription.name,
                subscription_status: subscription.status!,
            });
        } catch {
        } finally {
            setIsSubmitting(false);
        }
    };

    const logoUrl = subscription.icon ? getLogoUrl(subscription.icon!) : null;

    return (
        <Pressable
            onPress={onPress}
            className={clsx(
                "sub-card",
                expanded ? "bg-card-expanded" : "bg-card",
            )}
            style={
                !expanded
                    ? { backgroundColor: subscription?.color ?? "#ffffff" }
                    : undefined
            }
        >
            <View className="sub-head">
                <View className="sub-main">
                    <Image
                        source={logoUrl ? { uri: logoUrl } : icons.plus}
                        className="sub-icon"
                    />
                    <View className="sub-copy">
                        <Text numberOfLines={1} className="sub-title">
                            {subscription.name}
                        </Text>
                        <Text
                            className="sub-meta"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {subscription.category?.trim() ||
                                subscription.plan?.trim() ||
                                (subscription.renewalDate
                                    ? formatSubscriptionDateTime(
                                          subscription.renewalDate,
                                      )
                                    : "")}
                        </Text>
                    </View>
                </View>

                <View className="sub-price-box">
                    <Text className="sub-price">
                        {formatCurrency(
                            subscription.price,
                            subscription.currency,
                        )}
                    </Text>
                    <Text className="sub-billing">
                        {subscription.frequency}
                    </Text>
                </View>
            </View>
            {expanded && (
                <View className="sub-body">
                    <View className="sub-details">
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Type : </Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {subscription.frequency}
                                </Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Category : </Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {subscription.category?.trim() ||
                                        subscription.plan?.trim()}
                                </Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Started : </Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {subscription.startDate
                                        ? formatSubscriptionDateTime(
                                              subscription.startDate,
                                          )
                                        : ""}
                                </Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">
                                    Renewal date :{" "}
                                </Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {subscription.renewalDate
                                        ? formatSubscriptionDateTime(
                                              subscription.renewalDate,
                                          )
                                        : ""}
                                </Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Status : </Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {subscription.status
                                        ? formatStatusLabel(subscription.status)
                                        : ""}
                                </Text>
                            </View>
                        </View>
                        <View className="sub-buttons-row">
                            <TouchableOpacity
                                className="sub-btn-delete"
                                onPress={() => setDeleteModalVisible(true)}
                            >
                                <Text className="text-red-400">Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="sub-btn-update"
                                onPress={() => setUpdateModalVisible(true)}
                            >
                                <Text className="text-blue-400">Update</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="sub-btn-pause"
                                disabled={isSubmitting}
                                onPress={() =>
                                    handleChangeStatus(
                                        subscription.id,
                                        subscription.status!,
                                    )
                                }
                            >
                                <Text className="text-purple-400">
                                    {isSubmitting
                                        ? "..."
                                        : subscription.status === "paused"
                                          ? "Activate"
                                          : "Pause"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <UpdateSubscriptionModal
                        subscription={subscription}
                        visible={isUpdateModalVisible}
                        onClose={() => setUpdateModalVisible(false)}
                        onSubmit={handleUpdateSubscription}
                    />
                    <DeleteSubscriptionModal
                        subscription={subscription}
                        visible={isDeleteModalVisible}
                        onClose={() => setDeleteModalVisible(false)}
                        onSubmit={handleDeleteSubscription}
                    />
                </View>
            )}
        </Pressable>
    );
};

export default SubscriptionCard;
