import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { icons } from "../../constants/icons";

interface InsightsHeaderProps {
    onOptionsPress?: () => void;
}

export default function InsightsHeader({ onOptionsPress }: InsightsHeaderProps) {
    return (
        <View className="insights-header">
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

            <Text className="insights-title">Monthly Insights</Text>

            <Pressable
                className="circle-icon-btn"
                onPress={onOptionsPress}
                accessibilityLabel="More options"
            >
                <Image
                    source={icons.menu}
                    className="size-5"
                    resizeMode="contain"
                />
            </Pressable>
        </View>
    );
}
