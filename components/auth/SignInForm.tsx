import { View } from "react-native";
import { AuthButton, AuthEmail, AuthPassword } from "@auth";
import { useSignIn } from "@clerk/expo";
import { router } from "expo-router";
import { isSignInFormValid } from "../../lib/validation";
import { useState } from "react";
import { navigateAfterAuth } from "../../lib/navigation";
import { posthog, posthogLogger } from "../../lib/posthog";
import {
    getErrorMessage,
    showErrorToast,
    showSuccessToast,
} from "../../lib/toast";

const SignInForm = () => {
    const { errors, fetchStatus, signIn } = useSignIn();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");

    const formValid = isSignInFormValid(emailAddress, password);

    const handleSubmitSignIn = async () => {
        if (!formValid) return;

        const { error } = await signIn.password({
            emailAddress,
            password,
        });

        if (error) {
            showErrorToast("Cannot sign in", getErrorMessage(error));
            return;
        }

        if (signIn.status === "complete") {
            posthog?.capture("user_signed_in", {
                authentication_method: "password",
            });

            posthogLogger.info("authentication completed", {
                authentication_method: "password",
                authentication_outcome: "success",
            });

            showSuccessToast("You signed in successfully!");

            await signIn.finalize({
                navigate: navigateAfterAuth,
            });
        } else if (signIn.status === "needs_second_factor") {
            // Handle MFA if needed (not implemented in this basic flow)
        } else if (signIn.status === "needs_client_trust") {
            // Send email code for client trust verification
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === "email_code",
            );

            if (emailCodeFactor) {
                await signIn.mfa.sendEmailCode();

                router.push({
                    pathname: "/(auth)/mfa-verification",
                    params: { emailAddress },
                });
            }
        } else {
            showErrorToast("Sign-in attempt not complete");
        }
    };

    return (
        <View className="auth-card">
            <View className="auth-form">
                <AuthEmail
                    email={emailAddress}
                    onEmailChange={setEmailAddress}
                    serverError={errors.fields.identifier?.message}
                />

                <AuthPassword
                    password={password}
                    onPasswordChange={setPassword}
                    serverError={errors.fields.password?.message}
                />

                <AuthButton
                    submit={handleSubmitSignIn}
                    submitting={fetchStatus === "fetching"}
                    textBeforeSubmitting="Sign In"
                    textWhenSubmitting="Signing In..."
                    whenDisabled={!formValid || fetchStatus === "fetching"}
                />
            </View>
        </View>
    );
};

export default SignInForm;
