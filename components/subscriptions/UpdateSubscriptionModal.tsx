import {
    View,
    Text,
    Modal,
    Pressable,
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
import ModalButton from "../modals/ModalButton";
import ModalInput from "../modals/ModalInput";
import ModalLabel from "../modals/ModalLabel";
import ModalNote from "../modals/ModalNote";

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
                
                <View className="flex-1">
                
                    <Pressable className="absolute inset-0 modal-overlay" onPress={handleClose}/>
                    
                    <View
                        className="modal-container"
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
                            nestedScrollEnabled
                            keyboardDismissMode={
                                Platform.OS === "ios" ? "interactive" : "on-drag"
                            }
                        >
                            <View className="auth-field">
                                <ModalLabel>Name</ModalLabel>
                                <ModalInput
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
                                <ModalLabel>Price</ModalLabel>
                                <View className="flex-row items-center gap-3">
                                    <ModalInput
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

                                    <ModalButton
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
                                        <ModalLabel className="mb-0">
                                            {form.currency}
                                        </ModalLabel>
                                    </ModalButton>
                                </View>
                                <ModalNote>
                                    Note: Changing the price only affects
                                    future expenses. Existing expenses keep the
                                    price that was recorded when they were
                                    created.
                                </ModalNote>
                            </View>

                            <View className="auth-field">
                                <ModalLabel>Frequency</ModalLabel>
                                <View className="picker-row">
                                    {FREQUENCIES.map((value) => (
                                        <ModalButton
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
                                            <ModalLabel
                                                className={clsx(
                                                    "picker-option-text",
                                                    form.frequency === value &&
                                                        "picker-option-text-active",
                                                )}
                                            >
                                                {value}
                                            </ModalLabel>
                                        </ModalButton>
                                    ))}
                                </View>
                                <ModalNote>
                                    Note: Changing the frequency or frequency
                                    period only affects future expenses.
                                    Existing expenses keep the values that were
                                    recorded when they were created.
                                </ModalNote>
                            </View>

                            <View className="auth-field">
                                <ModalLabel>Every</ModalLabel>
                                <View className="flex-row items-center gap-3">
                                    <ModalInput
                                        style={{ paddingLeft: 20 }}
                                        className="auth-input flex-2"
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
                                <ModalLabel>Category</ModalLabel>
                                <View className="category-scroll">
                                    {CATEGORIES.map((cat) => (
                                        <ModalButton
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
                                            <ModalLabel
                                                className={clsx(
                                                    "category-chip-text",
                                                    form.category === cat &&
                                                        "category-chip-text-active",
                                                )}
                                            >
                                                {cat}
                                            </ModalLabel>
                                        </ModalButton>
                                    ))}
                                </View>
                            </View>

                            <ModalButton
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
                            </ModalButton>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default UpdateSubscriptionModal;
