import { AuthButton, AuthEmail, AuthPassword } from "@auth";
import { useSignUp } from "@clerk/expo";
import { useState } from "react";
import { View, Text } from "react-native";
import { isFormValid } from "../../lib/validation";
import { router } from "expo-router";
import { getErrorMessage, showErrorToast } from "../../lib/toast";

const SignUpForm = () => {
    const { signUp, errors, fetchStatus } = useSignUp();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");

    const formValid = isFormValid(emailAddress, password);

    const handleSubmit = async () => {
        if (!formValid) return;

        const { error } = await signUp.password({
            emailAddress,
            password,
        });

        if (error) {
            showErrorToast("Cannot Register", getErrorMessage(error));
            return;
        }

        await signUp.verifications.sendEmailCode();

        router.replace({
            pathname: "/(auth)/email-verification",
            params: { emailAddress },
        });
    };

    return (
        <View className="auth-card">
            <View className="auth-form">
                <AuthEmail
                    email={emailAddress}
                    onEmailChange={setEmailAddress}
                    serverError={errors.fields.emailAddress?.message}
                />

                <AuthPassword
                    password={password}
                    onPasswordChange={setPassword}
                    serverError={errors.fields.password?.message}
                    helperOptions={
                        <Text className="auth-helper">
                            Minimum 8 characters required
                        </Text>
                    }
                />

                <AuthButton
                    submit={handleSubmit}
                    whenDisabled={!formValid || fetchStatus === "fetching"}
                    textBeforeSubmitting="Create Account"
                    textWhenSubmitting="Creating Account..."
                    submitting={fetchStatus === "fetching"}
                />
            </View>
        </View>
    );
};

export default SignUpForm;
