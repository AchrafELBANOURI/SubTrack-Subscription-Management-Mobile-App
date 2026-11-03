import { router, useLocalSearchParams } from "expo-router";
import { AuthEmailVerificationForm, AuthForm } from "@auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

const EmailVerification = () => {
    const { isSignedIn } = useAuth();
    const { signUp } = useSignUp();

    const { emailAddress } = useLocalSearchParams<{
        emailAddress: string;
    }>();

    const verificationRequired =
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address") &&
        signUp.missingFields.length === 0;

    useEffect(() => {
        if (isSignedIn || signUp.status === "complete") {
            router.replace("/(tabs)");
            return;
        }

        if (!verificationRequired) {
            router.replace("/(auth)/sign-up");
        }
    }, [isSignedIn, signUp.status, verificationRequired]);

    if (isSignedIn || signUp.status === "complete" || !verificationRequired) {
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
                formDetails={<AuthEmailVerificationForm />}
            />
        </KeyboardAvoidingView>
    );
};

export default EmailVerification;
