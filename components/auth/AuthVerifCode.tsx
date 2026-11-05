import { View, Text, TextInput } from "react-native";
import { AuthError } from "@auth";

type AuthVerifCodeProps = {
    code: string;
    onCodeChange: (code: string) => void;
    serverError?: string;
};

const AuthVerifCode = ({
    code,
    onCodeChange: setCode,
    serverError,
}: AuthVerifCodeProps) => {
    return (
        <View className="auth-field">
            <Text className="auth-label">Verification Code</Text>
            <TextInput
                style={{ paddingLeft : 10 , textAlignVertical: "center" }}
                className="auth-input"
                value={code}
                placeholder="Enter 6-digit code"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
            />

            <AuthError
                errorCondition={serverError}
                errorMessage={serverError}
            />
        </View>
    );
};

export default AuthVerifCode;
