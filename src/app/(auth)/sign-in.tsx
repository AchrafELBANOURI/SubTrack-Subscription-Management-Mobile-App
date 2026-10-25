import { AuthForm, SignInForm, AuthFooterLink } from "@auth";

const SignIn = () => {
    return (
        <AuthForm
            header={{
                title: "Welcome back",
                subtitle: "Sign in to continue managing your subscriptions",
            }}
            formDetails={<SignInForm />}
            footer={<AuthFooterLink />}
        />
    );
};

export default SignIn;
