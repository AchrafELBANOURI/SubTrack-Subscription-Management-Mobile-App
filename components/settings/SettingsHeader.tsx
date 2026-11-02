import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { icons } from "../../constants/icons";

interface SettingsHeaderProps {
    onOptionsPress?: () => void;
}

export default function SettingsHeader({
    onOptionsPress,
}: SettingsHeaderProps) {
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

            <Text className="tab-title">Settings</Text>

            <Pressable
                className="circle-icon-btn"
                onPress={() => onOptionsPress?.()}
                accessibilityLabel="More Options"
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
