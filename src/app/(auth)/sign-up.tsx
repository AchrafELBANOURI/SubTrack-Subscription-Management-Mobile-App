import { AuthFooterLink, AuthForm, SignUpForm } from "@auth";

const SignUp = () => {
    return (
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
    );
};

export default SignUp;
