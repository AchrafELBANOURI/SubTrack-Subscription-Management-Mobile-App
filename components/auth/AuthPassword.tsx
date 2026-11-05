import { View, Text, TextInput, Pressable, Image } from "react-native";
import { icons } from "../../constants/icons";
import { ReactNode, useState } from "react";
import { isValidPassword } from "../../lib/validation";
import { AuthError } from "@auth";

type AuthPasswordProps = {
    password: string;
    onPasswordChange: (password: string) => void;
    serverError?: string;
    helperOptions?: ReactNode;
};

const AuthPassword = ({
    password,
    onPasswordChange: setPassword,
    serverError,
    helperOptions,
}: AuthPasswordProps) => {
    const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const passwordValid = password.length === 0 || isValidPassword(password);

    return (
        <View className="auth-field">
            <Text className="auth-label">Password</Text>
            <View className="relative">
                <TextInput
                    style={{ paddingLeft : 10 , textAlignVertical: "center" }}
                    className={`auth-input pr-12 ${
                        passwordTouched && !passwordValid
                            ? "auth-input-error"
                            : ""
                    }`}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password"
                />

                <Pressable
                    onPress={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1 h-full justify-center px-3"
                >
                    <Image
                        source={showPassword ? icons.visible : icons.hide}
                        className="size-5"
                    />
                </Pressable>
            </View>

            <AuthError
                errorCondition={passwordTouched && !passwordValid}
                errorMessage="Password is required and must be at least 8 characters"
            />

            <AuthError
                errorCondition={serverError}
                errorMessage={serverError}
            />

            {!passwordTouched && helperOptions}
        </View>
    );
};

export default AuthPassword;
