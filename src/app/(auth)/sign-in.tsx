import { AuthForm, SignInForm, AuthFooterLink } from "@auth";
import { KeyboardAvoidingView, Platform } from "react-native";

const SignIn = () => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <AuthForm
                header={{
                    title: "Welcome back",
                    subtitle: "Sign in to continue managing your subscriptions",
                }}
                formDetails={<SignInForm />}
                footer={<AuthFooterLink />}
            />
        </KeyboardAvoidingView>
    );
};

export default SignIn;
