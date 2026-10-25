import { View, Text } from "react-native";

const AuthBrand = ({ title, subtitle }: AuthBrandProps) => {
    return (
        <View className="auth-brand-block">
            <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">ST</Text>
                </View>
                <View>
                    <Text className="auth-wordmark">SubTrack</Text>
                    <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                </View>
            </View>
            <Text className="auth-title">{title}</Text>
            <Text className="auth-subtitle">{subtitle}</Text>
        </View>
    );
};

export default AuthBrand;
