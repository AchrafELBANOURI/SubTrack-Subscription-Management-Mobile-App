import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import SafeScreen from "../SafeScreen";
import { AuthBrand } from "@auth";
import { ReactNode } from "react";

type AuthFormProps = {
    header?: AuthBrandProps;
    formDetails: ReactNode;
    footer?: ReactNode;
    captcha?: boolean;
};

const AuthForm = ({
    header,
    formDetails,
    footer,
    captcha = false,
}: AuthFormProps) => {
    return (
        <SafeScreen className="auth-safe-area">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="auth-screen"
            >
                <ScrollView
                    className="auth-scroll"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="auth-content">
                        {header && (
                            <AuthBrand
                                title={header?.title}
                                subtitle={header?.subtitle}
                            />
                        )}
                        {/* Form [Verification | Sign-In | Sign-Out ...] */}
                        {formDetails}

                        {footer}

                        {captcha && <View nativeID="clerk-captcha" />}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeScreen>
    );
};

export default AuthForm;
