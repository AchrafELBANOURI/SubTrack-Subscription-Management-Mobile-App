import Toast, {
    BaseToast,
    ErrorToast,
    type ToastConfig,
} from "react-native-toast-message";

const toastConfig: ToastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                zIndex: 9999,
                elevation: 9999,
                borderLeftColor: "#22c55e",
                backgroundColor: "#111827",
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 14, fontWeight: "700", color: "#f9fafb" }}
            text2Style={{ fontSize: 12, color: "#d1d5db" }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                zIndex: 9999,
                elevation: 9999,
                backgroundColor: "#111827",
            }}
            text1Style={{ fontSize: 14, fontWeight: "700", color: "#f9fafb" }}
            text2Style={{ fontSize: 12, color: "#d1d5db" }}
        />
    ),
};

export default function AppToast() {
    return (
        <Toast
            config={toastConfig}
            position="top"
            topOffset={60}
            animationConfig={{ type: "spring", speed: 20 }}
        />
    );
}
