import { View, Text, Image } from "react-native";
import images from "../../constants/images";

const AuthBrand = ({ title, subtitle }: AuthBrandProps) => {
    return (
        <View className="auth-brand-block">
            <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                    <Image source={images.logo} className="auth-logo-mark-icon"/>
                </View>
                <View>
                    <Text className="auth-wordmark">SubTrack</Text>
                    <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                </View>
            </View>
            <View className="auth-header">
                <Text className="auth-title" style={{textAlignVertical : "center"}}>{title}</Text>
                <Text className="auth-subtitle" style={{textAlignVertical : "center"}}>{subtitle}</Text>
            </View>
        </View>
    );
};

export default AuthBrand;
