import { View } from "react-native";
import { useSignUp } from "@clerk/expo";
import { navigateAfterAuth } from "../../lib/navigation";
import { AuthButton, AuthVerifCode } from "@auth";
import { useState } from "react";

const AuthEmailVerificationForm = () => {
    const { errors, signUp, fetchStatus } = useSignUp();

    const [code, setCode] = useState("");

    const handleCodeVerification = async () => {
        await signUp.verifications.verifyEmailCode({
            code,
        });

        if (signUp.status !== "complete") {
            console.error("Sign-up attempt not complete: ", signUp);
            return;
        }

        await signUp.finalize({
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
                    submit={() => signUp.verifications.sendEmailCode()}
                    customButtonClassName="auth-secondary-button"
                    customTextClassName="auth-secondary-button-text"
                    whenDisabled={fetchStatus === "fetching"}
                    textBeforeSubmitting="Resend Code"
                />
            </View>
        </View>
    );
};

export default AuthEmailVerificationForm;
