import { useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useSignIn } from "@clerk/expo";
import { AuthForm, AuthMFAVerificationForm } from "@auth";
import { KeyboardAvoidingView, Platform } from "react-native";

const MFAVerificationScreen = () => {
    const { signIn } = useSignIn();
    const { emailAddress } = useLocalSearchParams<{
        emailAddress: string;
    }>();

    useEffect(() => {
        if (signIn.status !== "needs_client_trust") {
            router.replace("/(auth)/sign-in");
        }
    }, [signIn.status]);

    if (signIn.status !== "needs_client_trust") {
        return null;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <AuthForm
                header={{
                    title: "Verify your email",
                    subtitle: `We sent a verification code to ${emailAddress}`,
                }}
                formDetails={<AuthMFAVerificationForm />}
            />
        </KeyboardAvoidingView>
    );
};

export default MFAVerificationScreen;
