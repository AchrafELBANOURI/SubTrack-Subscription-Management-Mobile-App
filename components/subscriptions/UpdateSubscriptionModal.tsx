import {
    View,
    Text,
    Modal,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useReducer, useState } from "react";

import { clsx } from "clsx";

import { posthog } from "../../lib/posthog";
import { formReducer } from "../../lib/subscriptionFormReducer";
import {
    CATEGORIES,
    CATEGORY_COLORS,
    CURRENCY_OPTIONS,
    FREQUENCIES,
} from "../../constants/sub-modal-form.constants";
import { getRenewalDateFromForm } from "../../lib/uttils";
import { validateSubscriptionForm } from "../../lib/validation";

interface UpdateSubscriptionModalProps {
    subscription: Subscription;
    visible: boolean;
    onClose: () => void;
    onSubmit: (
        subscriptionId: string,
        subscription: SubscriptionPayload,
    ) => Promise<void>;
}

const getInitialState = (subscription: SubscriptionPayload): FormState => ({
    name: subscription.name ?? "",
    price: String(subscription.price ?? 0),
    currency: subscription.currency ?? "USD",
    plan: subscription.plan ?? "",
    frequency: subscription.frequency ?? "Monthly",
    frequencyPeriod: subscription.frequencyPeriod ?? {
        frequency: 1,
        period: "Months",
    },
    category: subscription.category ?? "Other",
});

const UpdateSubscriptionModal = ({
    subscription,
    visible,
    onClose,
    onSubmit,
}: UpdateSubscriptionModalProps) => {
    const initialFormState = getInitialState(subscription);
    const [form, dispatch] = useReducer(formReducer, initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValidForm = validateSubscriptionForm(form.name, form.price);

    const handleSubmit = async () => {
        if (!isValidForm || isSubmitting) return;

        setIsSubmitting(true);

        const updatedSubscription: SubscriptionPayload = {
            name: form.name.trim(),
            price: Number(form.price.trim()),
            currency: form.currency,
            frequency: form.frequency,
            frequencyPeriod: form.frequencyPeriod,
            category: form.category,
            status: "active",
            renewalDate: getRenewalDateFromForm(form),
            color: CATEGORY_COLORS[form.category],
        };

        try {
            await onSubmit(subscription.id, updatedSubscription);

            posthog?.capture("subscription_created", {
                subscription_name: form.name.trim(),
                subscription_price: Number(form.price.trim()),
                subscription_frequency: form.frequency,
                subscription_category: form.category,
            });

            dispatch({
                type: "reset",
                initialState: getInitialState(subscription),
            });
        } finally {
            onClose();
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        dispatch({
            type: "reset",
            initialState: getInitialState(subscription),
        });
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
                <Pressable className="modal-overlay" onPress={handleClose}>
                    <Pressable
                        className="modal-container"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="modal-header">
                            <Text className="modal-title">
                                Update Subscription
                            </Text>
                            <Pressable
                                className="modal-close"
                                onPress={handleClose}
                            >
                                <Text className="modal-close-text">X</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            className="px-5 py-1"
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{
                                gap: 20,
                                paddingBottom: 20,
                            }}
                        >
                            <View className="auth-field">
                                <Text className="auth-label">Name</Text>
                                <TextInput
                                    className="auth-input"
                                    placeholder="Subscription name"
                                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                    value={form.name}
                                    onChangeText={(value) =>
                                        dispatch({
                                            type: "update",
                                            field: "name",
                                            value,
                                        })
                                    }
                                />
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Price</Text>
                                <View className="flex-row items-center gap-3">
                                    <TextInput
                                        className="auth-input flex-1"
                                        placeholder="0.00"
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        value={form.price}
                                        onChangeText={(value) =>
                                            dispatch({
                                                type: "update",
                                                field: "price",
                                                value,
                                            })
                                        }
                                        keyboardType="decimal-pad"
                                    />

                                    <Pressable
                                        className="auth-input w-[90px] items-center justify-center"
                                        onPress={() => {
                                            const currentIndex =
                                                CURRENCY_OPTIONS.indexOf(
                                                    form.currency,
                                                );
                                            const nextIndex =
                                                (currentIndex + 1) %
                                                CURRENCY_OPTIONS.length;
                                            dispatch({
                                                type: "update",
                                                field: "currency",
                                                value: CURRENCY_OPTIONS[
                                                    nextIndex
                                                ],
                                            });
                                        }}
                                    >
                                        <Text className="auth-label mb-0">
                                            {form.currency}
                                        </Text>
                                    </Pressable>
                                </View>
                                <Text className="modal-note">
                                    Note: Changing the price only affects
                                    future expenses. Existing expenses keep the
                                    price that was recorded when they were
                                    created.
                                </Text>
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Frequency</Text>
                                <View className="picker-row">
                                    {FREQUENCIES.map((value) => (
                                        <Pressable
                                            key={value}
                                            className={clsx(
                                                "picker-option",
                                                form.frequency === value &&
                                                    "picker-option-active",
                                            )}
                                            onPress={() =>
                                                dispatch({
                                                    type: "set-frequency",
                                                    value,
                                                })
                                            }
                                        >
                                            <Text
                                                className={clsx(
                                                    "picker-option-text",
                                                    form.frequency === value &&
                                                        "picker-option-text-active",
                                                )}
                                            >
                                                {value}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Every</Text>
                                <View className="flex-row items-center gap-3">
                                    <TextInput
                                        className="auth-input flex-1"
                                        placeholder="1"
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        value={String(
                                            form.frequencyPeriod.frequency,
                                        )}
                                        onChangeText={(value) => {
                                            const normalizedValue =
                                                value.replace(/[^0-9]/g, "") ||
                                                "0";
                                            dispatch({
                                                type: "update",
                                                field: "frequencyPeriod",
                                                value: {
                                                    ...form.frequencyPeriod,
                                                    frequency:
                                                        Number(normalizedValue),
                                                },
                                            });
                                        }}
                                        keyboardType="number-pad"
                                    />
                                    <Text className="auth-input flex-1 text-center auth-label mb-0">
                                        {form.frequencyPeriod.period}
                                    </Text>
                                </View>
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Category</Text>
                                <View className="category-scroll">
                                    {CATEGORIES.map((cat) => (
                                        <Pressable
                                            key={cat}
                                            className={clsx(
                                                "category-chip",
                                                form.category === cat &&
                                                    "category-chip-active",
                                            )}
                                            onPress={() =>
                                                dispatch({
                                                    type: "update",
                                                    field: "category",
                                                    value: cat,
                                                })
                                            }
                                        >
                                            <Text
                                                className={clsx(
                                                    "category-chip-text",
                                                    form.category === cat &&
                                                        "category-chip-text-active",
                                                )}
                                            >
                                                {cat}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            <Pressable
                                className={clsx(
                                    "auth-button",
                                    (!isValidForm || isSubmitting) &&
                                        "auth-button-disabled",
                                )}
                                onPress={handleSubmit}
                                disabled={!isValidForm || isSubmitting}
                            >
                                <Text className="auth-button-text">
                                    {isSubmitting
                                        ? "Updating..."
                                        : "Update Subscription"}
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default UpdateSubscriptionModal;
