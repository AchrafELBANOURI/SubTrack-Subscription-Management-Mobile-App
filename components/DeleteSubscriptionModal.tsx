import {
    View,
    Text,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useState } from "react";

import { clsx } from "clsx";

import { posthog } from "../lib/posthog";

interface DeleteSubscriptionModalProps {
    subscription: Subscription;
    visible: boolean;
    onClose: () => void;
    onSubmit: (subscriptionId: string) => Promise<void>;
}

const DeleteSubscriptionModal = ({
    subscription,
    visible,
    onClose,
    onSubmit,
}: DeleteSubscriptionModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(subscription.id);

            posthog?.capture("subscription_removed", {
                subscription_name: subscription.name.trim(),
                subscription_price: subscription.price,
                subscription_frequency: subscription.frequency?.toString()!,
                subscription_category: subscription.category?.toString()!,
            });
        } finally {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsSubmitting(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <Pressable
                    className="modal-overlay justify-center items-center"
                    onPress={handleClose}
                >
                    <Pressable
                        className="w-[50%] bg-background rounded-3xl"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="modal-header">
                            <Text className="modal-title">
                                Delete Subscription
                            </Text>
                            <Pressable
                                className="modal-close"
                                onPress={handleClose}
                            >
                                <Text className="modal-close-text">X</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            className="pt-5 px-5"
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{
                                gap: 20,
                                paddingBottom: 20,
                            }}
                        >
                            <View className="auth-field">
                                <Text className="auth-label">
                                    Are you sure you want remove this
                                    subscription ?
                                </Text>
                            </View>
                        </ScrollView>

                        <View className="flex-row justify-end gap-2 pb-3 px-5">
                            <Pressable
                                className={clsx(
                                    "auth-button w-18 px-2",
                                    isSubmitting ?? "auth-button-disabled",
                                )}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                <Text className="auth-button-text">
                                    {isSubmitting ? "Deleting..." : "Yes"}
                                </Text>
                            </Pressable>
                            <Pressable
                                className={clsx(
                                    "auth-secondary-button w-18 px-2",
                                    isSubmitting ?? "auth-button-disabled",
                                )}
                                onPress={handleClose}
                                disabled={isSubmitting}
                            >
                                <Text className="auth-secondary-button-text">
                                    Cancel
                                </Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default DeleteSubscriptionModal;
