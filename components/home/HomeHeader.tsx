import { Image, Pressable, Text, View } from "react-native";
import images from "../../constants/images";
import { icons } from "../../constants/icons";

type HomeHeaderProps = {
    fullName: string;
    handlePressAddIcon: () => void;
};

export default function HomeHeader({
    fullName,
    handlePressAddIcon,
}: HomeHeaderProps) {
    return (
        <View className="home-header">
            <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{fullName || "User"}</Text>
            </View>
            <Pressable onPress={handlePressAddIcon}>
                <Image source={icons.add} className="home-add-icon" />
            </Pressable>
        </View>
    );
}
