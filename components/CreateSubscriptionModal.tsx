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
import dayjs from "dayjs";

import { icons } from "../constants/icons";

import { posthog } from "../lib/posthog";
import {
    CATEGORIES,
    CATEGORY_COLORS,
    CURRENCY_OPTIONS,
    DEFAULT_FORM_STATE,
    FREQUENCIES,
} from "../constants/sub-modal-form.constants";
import { getRenewalDateFromForm } from "../lib/uttils";
import { validateSubscriptionForm } from "../lib/validation";
import { formReducer } from "../lib/subscriptionFormReducer";

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (subscription: Subscription) => Promise<void>;
}

const CreateSubscriptionModal = ({
    visible,
    onClose,
    onSubmit,
}: CreateSubscriptionModalProps) => {
    const [form, dispatch] = useReducer(formReducer, DEFAULT_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValidForm = validateSubscriptionForm(form.name, form.price);

    const handleSubmit = async () => {
        if (!isValidForm || isSubmitting) return;

        setIsSubmitting(true);

        const priceValue = Number(form.price.trim());
        const now = dayjs();

        const newSubscription: Subscription = {
            id: `sub-${now.toISOString()}`,
            name: form.name.trim(),
            price: priceValue,
            currency: form.currency,
            frequency: form.frequency,
            frequencyPeriod: form.frequencyPeriod,
            category: form.category,
            status: "active",
            renewalDate: getRenewalDateFromForm(form),
            icon: icons.plus,
            color: CATEGORY_COLORS[form.category],
        };

        try {
            await onSubmit(newSubscription);

            posthog?.capture("subscription_created", {
                subscription_name: form.name.trim(),
                subscription_price: priceValue,
                subscription_frequency: form.frequency,
                subscription_category: form.category,
            });

            dispatch({ type: "reset" });
        } finally {
            onClose();
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        dispatch({ type: "reset" });
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
                                New Subscription
                            </Text>
                            <Pressable
                                className="modal-close"
                                onPress={handleClose}
                            >
                                <Text className="modal-close-text">X</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            className="p-5"
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
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Plan</Text>
                                <TextInput
                                    className="auth-input"
                                    placeholder="free trial | free plan | entreprise plan..."
                                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                    value={form.plan}
                                    onChangeText={(value) =>
                                        dispatch({
                                            type: "update",
                                            field: "plan",
                                            value,
                                        })
                                    }
                                />
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
                                    <Text className="auth-input flex-[1.1] auth-label mb-0">
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
                                        ? "Creating..."
                                        : "Create Subscription"}
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CreateSubscriptionModal;
