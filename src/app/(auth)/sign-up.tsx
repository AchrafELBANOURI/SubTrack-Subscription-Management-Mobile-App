import { AuthFooterLink, AuthForm, SignUpForm } from "@auth";
import { KeyboardAvoidingView, Platform } from "react-native";

const SignUp = () => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <AuthForm
                header={{
                    title: "Create your account",
                    subtitle:
                        "Start tracking your subscriptions and never miss a payment",
                }}
                formDetails={<SignUpForm />}
                footer={<AuthFooterLink toSignIn />}
                captcha
            />
        </KeyboardAvoidingView>
    );
};

export default SignUp;
