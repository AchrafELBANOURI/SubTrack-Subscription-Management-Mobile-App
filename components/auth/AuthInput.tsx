import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { isValidEmail, isValidInput } from "../../lib/validation";
import { AuthError } from "@auth";

type AuthInputProps = {
    value: string;
    onValueChange: (value: string) => void;
    serverError?: string;
    label: string;
    placeholder: string;
};

const AuthInput = ({
    value: inputValue,
    onValueChange: setInputValue,
    serverError,
    label,
    placeholder,
}: AuthInputProps) => {
    const [touched, setTouched] = useState<boolean>(false);

    const isValid: boolean =
        inputValue.length === 0 || isValidInput(inputValue);

    return (
        <View className="auth-field">
            <Text className="auth-label">{label}</Text>
            <TextInput
                className={`auth-input ${touched && !isValid && "auth-input-error"}`}
                autoCapitalize="none"
                value={inputValue}
                placeholder={placeholder}
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                onChangeText={setInputValue}
                onBlur={() => setTouched(true)}
                keyboardType="default"
                autoComplete="off"
            />

            <AuthError
                errorCondition={touched && !isValid}
                errorMessage="Please enter a valid input"
            />

            <AuthError
                errorCondition={serverError}
                errorMessage={serverError}
            />
        </View>
    );
};

export default AuthInput;
