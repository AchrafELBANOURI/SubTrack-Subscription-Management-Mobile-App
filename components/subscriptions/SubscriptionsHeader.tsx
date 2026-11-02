import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { icons } from "../../constants/icons";

interface SubscriptionsHeaderProps {
    onAddPress?: () => void;
}

export default function SubscriptionsHeader({
    onAddPress,
}: SubscriptionsHeaderProps) {
    return (
        <View className="tab-header px-5">
            <Pressable
                className="circle-icon-btn"
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace("/(tabs)");
                    }
                }}
                accessibilityLabel="Go back"
            >
                <Image
                    source={icons.back}
                    className="size-5"
                    resizeMode="contain"
                />
            </Pressable>

            <Text className="tab-title">Subscriptions</Text>

            <Pressable
                className="circle-icon-btn"
                onPress={onAddPress}
                accessibilityLabel="Add Subscription"
            >
                <Image
                    source={icons.add}
                    className="size-5"
                    resizeMode="contain"
                />
            </Pressable>
        </View>
    );
}
