import { View } from "react-native";
import { useSignIn } from "@clerk/expo";
import { navigateAfterAuth } from "../../lib/navigation";
import { AuthButton, AuthVerifCode } from "@auth";
import { useState } from "react";
import { posthog } from "../../lib/posthog";

const AuthMFAVerificationForm = () => {
    const { signIn, fetchStatus, errors } = useSignIn();
    const [code, setCode] = useState("");

    const handleCodeVerification = async () => {
        await signIn.mfa.verifyEmailCode({ code });

        if (signIn.status !== "complete") {
            console.error("Sign-in attempt not complete:", signIn);
            return;
        }

        posthog?.capture("user_signed_in", {
            authentication_method: "mfa_email_code",
        });

        await signIn.finalize({
            navigate: navigateAfterAuth,
        });
    };

    return (
        <View className="auth-card">
            <View className="auth-form">
                <AuthVerifCode
                    code={code}
                    onCodeChange={setCode}
                    serverError={errors.fields.code?.message}
                />

                <AuthButton
                    submit={handleCodeVerification}
                    whenDisabled={!code || fetchStatus === "fetching"}
                    textBeforeSubmitting="Verify Email"
                    textWhenSubmitting="Verifying..."
                    submitting={fetchStatus === "fetching"}
                />

                <AuthButton
                    submit={() => signIn.mfa.sendEmailCode()}
                    customButtonClassName="auth-secondary-button"
                    customTextClassName="auth-secondary-button-text"
                    whenDisabled={fetchStatus === "fetching"}
                    textBeforeSubmitting="Resend Code"
                />

                <AuthButton
                    submit={() => signIn.reset()}
                    customButtonClassName="auth-secondary-button"
                    customTextClassName="auth-secondary-button-text"
                    whenDisabled={fetchStatus === "fetching"}
                    textBeforeSubmitting="Start Over"
                />
            </View>
        </View>
    );
};

export default AuthMFAVerificationForm;
