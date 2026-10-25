import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";

type AuthScreens = "/(auth)/sign-in" | "/(auth)/sign-up";

const AuthFooterLink = ({ toSignIn = false }: { toSignIn?: boolean }) => {
    const header: string = toSignIn
        ? "Already have an account?"
        : "Don't have an account?";
    const authScreen: AuthScreens = toSignIn
        ? "/(auth)/sign-in"
        : "/(auth)/sign-up";
    const buttonText: string = toSignIn ? "Sign In" : "Create Account";

    return (
        <View className="auth-link-row">
            <Text className="auth-link-copy">{header}</Text>
            <Link href={authScreen} asChild>
                <Pressable>
                    <Text className="auth-link">{buttonText}</Text>
                </Pressable>
            </Link>
        </View>
    );
};

export default AuthFooterLink;
