import { Image, Pressable, Text, View } from "react-native";
import images from "../../constants/images";
import { HOME_USER } from "../../constants/data";
import { icons } from "../../constants/icons";

type HomeHeaderProps = {
    handlePressAddIcon: () => void;
};

export default function HomeHeader({ handlePressAddIcon }: HomeHeaderProps) {
    return (
        <View className="home-header">
            <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
            </View>
            <Pressable onPress={handlePressAddIcon}>
                <Image source={icons.add} className="home-add-icon" />
            </Pressable>
        </View>
    );
}
