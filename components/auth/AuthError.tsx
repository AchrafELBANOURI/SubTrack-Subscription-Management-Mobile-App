import { Text } from "react-native";

type AuthErrorProps = {
    errorCondition?: boolean | string;
    errorMessage?: string;
};

const AuthError = ({
    errorCondition: errorExists,
    errorMessage: error,
}: AuthErrorProps) => {
    if (!errorExists) return null;
    return <Text className="auth-error">{error}</Text>;
};

export default AuthError;
