import { Text, Pressable } from "react-native";

type AuthButtonProps = {
    submit: () => void;
    submitting?: boolean;
    whenDisabled: boolean;
    textBeforeSubmitting: string;
    textWhenSubmitting?: string;
    customButtonClassName?: string;
    customTextClassName?: string;
};

const AuthButton = ({
    submit,
    submitting,
    whenDisabled,
    textWhenSubmitting,
    textBeforeSubmitting,
    customButtonClassName,
    customTextClassName,
}: AuthButtonProps) => {
    return (
        <Pressable
            className={
                customButtonClassName ||
                `auth-button ${whenDisabled ? "auth-button-disabled" : ""}`
            }
            onPress={submit}
            disabled={whenDisabled}
        >
            <Text className={customTextClassName || `auth-button-text`}>
                {submitting ? textWhenSubmitting : textBeforeSubmitting}
            </Text>
        </Pressable>
    );
};

export default AuthButton;
