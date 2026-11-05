import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
    Easing,
} from "react-native-reanimated";

import { colors } from "../../constants/theme";
import { Platform } from "expo";

const MAX_DATA_VALUE = 45;
const MAX_BAR_HEIGHT = Platform.OS === "ios" ? 115 : 168;

interface AnimatedBarProps {
    item: WeeklyDayExpense;
    isSelected: boolean;
    onPress: () => void;
    index: number;
}

export default function AnimatedBar({
    item,
    isSelected,
    onPress,
    index,
}: AnimatedBarProps) {

    const rawRatio = Math.min(Math.max(item.amount / MAX_DATA_VALUE + 0.02, 0.02), 1);
    const targetHeight = rawRatio * MAX_BAR_HEIGHT;

    const animatedHeight = useSharedValue(0);
    const tooltipScale = useSharedValue(isSelected ? 1 : 0);

    useEffect(() => {
        animatedHeight.value = withDelay(
            index * 60,
            withTiming(targetHeight, {
                duration: 700,
                easing: Easing.out(Easing.cubic),
            }),
        );
    }, [targetHeight, index, animatedHeight]);

    useEffect(() => {
        tooltipScale.value = withSpring(isSelected ? 1 : 0, {
            damping: 14,
            stiffness: 150,
        });
    }, [isSelected, tooltipScale]);

    const barStyle = useAnimatedStyle(() => ({
        height: animatedHeight.value,
        backgroundColor: isSelected ? colors.accent : colors.primary,
    }));

    const tooltipStyle = useAnimatedStyle(() => ({
        transform: [{ scale: tooltipScale.value }],
        opacity: tooltipScale.value,
    }));

    return (
        <Pressable
            onPress={onPress}
            className="flex-1 items-center justify-end h-full relative bottom-0.5"
        >
            {/* Tooltip bubble above selected bar */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        bottom: Platform.OS === "ios" ? targetHeight + 20 : targetHeight + 8,
                        alignItems: "center",
                        zIndex: 10,
                    },
                    tooltipStyle,
                ]}
                pointerEvents="none"
            >
                <View className="rounded-lg bg-white px-2 py-0.5 shadow-sm">
                    <Text className="text-xs font-sans-bold text-accent w-full">
                        ${Math.round(item.amount)}
                    </Text>
                </View>
                {/* Downward triangle/caret */}
                <View
                    style={{
                        width: 0,
                        height: 0,
                        backgroundColor: "transparent",
                        borderStyle: "solid",
                        borderLeftWidth: 4,
                        borderRightWidth: 4,
                        borderTopWidth: 4,
                        borderLeftColor: "transparent",
                        borderRightColor: "transparent",
                        borderTopColor: "#ffffff",
                    }}
                />
            </Animated.View>

            {/* The vertical bar */}
            <Animated.View
                style={[
                    {
                        width: 10,
                        borderRadius: 2,
                    },
                    barStyle,
                ]}
            />

            {/* Day label below bar */}
            <Text
                className={`mt-1 text-xs ${
                    isSelected
                        ? "font-sans-bold text-accent"
                        : "font-sans-medium text-primary/75"
                }`}
            >
                {item.day}
            </Text>
        </Pressable>
    );
}
