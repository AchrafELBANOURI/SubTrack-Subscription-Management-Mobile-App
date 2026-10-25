import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { isValidEmail } from "../../lib/validation";
import { AuthError } from "@auth";

type AuthEmailProps = {
    email: string;
    onEmailChange: (email: string) => void;
    serverError?: string;
};

const AuthEmail = ({
    email: emailAddress,
    onEmailChange: setEmailAddress,
    serverError,
}: AuthEmailProps) => {
    const [emailTouched, setEmailTouched] = useState<boolean>(false);

    const emailValid: boolean =
        emailAddress.length === 0 || isValidEmail(emailAddress);

    return (
        <View className="auth-field">
            <Text className="auth-label">Email Address</Text>
            <TextInput
                className={`auth-input ${emailTouched && !emailValid && "auth-input-error"}`}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="name@example.com"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                onChangeText={setEmailAddress}
                onBlur={() => setEmailTouched(true)}
                keyboardType="email-address"
                autoComplete="email"
            />

            <AuthError
                errorCondition={emailTouched && !emailValid}
                errorMessage="Please enter a valid email address"
            />

            <AuthError
                errorCondition={serverError}
                errorMessage={serverError}
            />
        </View>
    );
};

export default AuthEmail;
