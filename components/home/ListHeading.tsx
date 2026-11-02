import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

const ListHeading = ({ title }: ListHeadingProps) => {
    const router = useRouter();
    return (
        <View className="list-head">
            <Text className="list-title">{title}</Text>

            <TouchableOpacity
                className="list-action"
                onPress={() => router.push("/(tabs)/Subscriptions")}
            >
                <Text className="list-action-text">View All</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ListHeading;
